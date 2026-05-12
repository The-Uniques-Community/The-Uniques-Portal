// controllers/migrationController.js
import Member from '../../models/member/memberModel.js';
import Event from '../../models/member/eventModel.js';

// Main migration function to update existing data to new schema structure
const migrateEventMemberRelationship = async (req, res) => {
  try {
    console.log("Starting database migration for event-member relationships...");
    
    // Step 1: Count documents before migration for reporting
    const memberCount = await Member.countDocuments();
    const eventCount = await Event.countDocuments();
    
    console.log(`Found ${memberCount} members and ${eventCount} events to process`);
    
    // Step 2: Process all members first
    const members = await Member.find({}).populate('event_participation');
    let updatedMembers = 0;
    let skippedMembers = 0;
    
    // Create a mapping to track which events need updating
    const eventsToUpdate = new Map(); // eventId -> [{memberId, contributionType}]
    
    // Process each member
    for (const member of members) {
      try {
        // Skip if no event participation data exists
        if (!member.event_participation || member.event_participation.length === 0) {
          skippedMembers++;
          continue;
        }
        
        // Create the new eventContributions array
        const eventContributions = [];
        
        // Loop through each event participation
        for (let i = 0; i < member.event_participation.length; i++) {
          const event = member.event_participation[i];
          
          // Skip if event is null or undefined (broken reference)
          if (!event) continue;
          
          // Get the contribution type, default to "Participant" if not specified
          // Use index if available, otherwise default
          const contributionType = member.eventContributionType && 
                                  i < member.eventContributionType.length ? 
                                  member.eventContributionType[i] : "Participant";
          
          // Add to member's eventContributions
          eventContributions.push({
            event: event._id,
            contributionType,
            joinedAt: new Date(),
            notes: `Migrated from legacy data structure`
          });
          
          // Track this for event updates
          if (!eventsToUpdate.has(event._id.toString())) {
            eventsToUpdate.set(event._id.toString(), []);
          }
          
          eventsToUpdate.get(event._id.toString()).push({
            memberId: member._id,
            contributionType
          });
        }
        
        // Only update if we found contributions to migrate
        if (eventContributions.length > 0) {
          // Update the member document to add the new field
          // Note: We're not removing the old fields yet for safety
          await Member.updateOne(
            { _id: member._id },
            { $set: { eventContributions } }
          );
          
          updatedMembers++;
        } else {
          skippedMembers++;
        }
      } catch (memberError) {
        console.error(`Error processing member ${member._id}:`, memberError);
        skippedMembers++;
      }
    }
    
    // Step 3: Now update all events with the collected member contributions
    let updatedEvents = 0;
    let skippedEvents = 0;
    
    for (const [eventId, memberContribsList] of eventsToUpdate.entries()) {
      try {
        // Build the memberContributions array for this event
        const memberContributions = memberContribsList.map(item => ({
          member: item.memberId,
          contributionType: item.contributionType,
          joinedAt: new Date(),
          notes: "Migrated from legacy data structure"
        }));
        
        // Update the event
        await Event.updateOne(
          { _id: eventId },
          { $set: { memberContributions } }
        );
        
        updatedEvents++;
      } catch (eventError) {
        console.error(`Error updating event ${eventId}:`, eventError);
        skippedEvents++;
      }
    }
    
    // Step 4: Return results
    return res.status(200).json({
      success: true,
      message: "Database migration completed successfully",
      stats: {
        members: {
          total: memberCount,
          updated: updatedMembers,
          skipped: skippedMembers
        },
        events: {
          total: eventCount,
          updated: updatedEvents,
          skipped: skippedEvents,
          notAffected: eventCount - updatedEvents - skippedEvents
        }
      }
    });
    
  } catch (error) {
    console.error("Migration failed:", error);
    return res.status(500).json({
      success: false,
      message: "Migration failed",
      error: error.message
    });
  }
};

// Optional: Function to verify the migration was successful
const verifyMigration = async (req, res) => {
  try {
    // Count documents with new fields
    const membersWithNewField = await Member.countDocuments({ 
      eventContributions: { $exists: true, $ne: [] } 
    });
    
    const eventsWithNewField = await Event.countDocuments({ 
      memberContributions: { $exists: true, $ne: [] } 
    });
    
    return res.status(200).json({
      success: true,
      stats: {
        membersWithNewField,
        eventsWithNewField
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Verification failed",
      error: error.message
    });
  }
};

// Optional: Rollback function (in case something goes wrong)
const rollbackMigration = async (req, res) => {
  try {
    // Only remove the new fields, don't touch existing data
    await Member.updateMany(
      {},
      { $unset: { eventContributions: "" } }
    );
    
    await Event.updateMany(
      {},
      { $unset: { memberContributions: "" } }
    );
    
    return res.status(200).json({
      success: true,
      message: "Rollback completed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Rollback failed",
      error: error.message
    });
  }
};

export { migrateEventMemberRelationship, verifyMigration, rollbackMigration };