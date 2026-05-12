

// routes/apiRoutes.js
import express from "express";
import multer from "multer";
import fs from "fs";
import mongoose from "mongoose";
import Member from "../models/member/memberModel.js";
import Event from "../models/member/eventModel.js";
import File from "../models/member/fileModel.js";
import Trainer from "../models/admin/trainerModel.js";
import {
  createFolder,
  findFolder,
  createFolderStructure,
  uploadFile,
} from "../controller/googleDriveService.js";
import path from "path";

// Clean up temporary directories on startup
function cleanupTempDirectories() {
  try {
    const uploadDir = '/tmp/uploads';
    if (fs.existsSync(uploadDir)) {
      const files = fs.readdirSync(uploadDir);
      files.forEach(file => {
        try {
          fs.unlinkSync(path.join(uploadDir, file));
          console.log(`Cleaned up leftover file: ${file}`);
        } catch (err) {
          console.error(`Error cleaning up file ${file}:`, err);
        }
      });
    }

    // Ensure the directory exists after cleanup
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    console.log("Temporary directory cleanup completed");
  } catch (error) {
    console.error("Error during temp directory cleanup:", error);
  }
}

// Add after the cleanupTempDirectories function

// Periodically clean old temporary files (files older than 15 minutes)
function scheduleCleanup() {
  try {
    const MAX_AGE_MS = 15 * 60 * 1000; // 15 minutes
    const uploadDir = '/tmp/uploads';

    if (fs.existsSync(uploadDir)) {
      const now = Date.now();
      const files = fs.readdirSync(uploadDir);

      files.forEach(file => {
        const filePath = path.join(uploadDir, file);
        try {
          const stats = fs.statSync(filePath);
          const fileAge = now - stats.mtimeMs;

          if (fileAge > MAX_AGE_MS) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up old temp file: ${file} (${Math.round(fileAge / 1000 / 60)} min old)`);
          }
        } catch (err) {
          console.error(`Error checking/removing old file ${file}:`, err);
        }
      });
    }
  } catch (error) {
    console.error("Error during scheduled cleanup:", error);
  }
}

// Run cleanup every 15 minutes if Lambda stays warm
const cleanupInterval = setInterval(scheduleCleanup, 15 * 60 * 1000);

// Ensure cleanup interval is cleared if the module is unloaded
process.on('beforeExit', () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }
});

// Call this function when the module is loaded
cleanupTempDirectories();

// Create the uploads directory in the writable /tmp folder
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const router = express.Router();

// Update the multer configuration to use /tmp/uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, '/tmp/uploads')  // Changed from '/var/task/uploads'
    },
  })
})

/**
 * POST /api/create_main_folder
 * Creates (or retrieves) the main folder on Google Drive.
 * Already created main folder:
 * 
 * ---------------------------- for 2.0 ----------------------------
        "folder": {
        "id": "1zhdebSyOQKNSPOF5dBQYemoCbAtOXDW9",
        "name": "The Uniques 2.0"
    }
  * -----------------------------------------------------------------
  * ---------------------------- for 3.0 ----------------------------
  *  "folder": {
        "id": "1I493SxTRY61hTzLauY1TZv7LC777XfGZ",
        "name": "The Uniques 3.0"
    }56
 */
router.post("/create_main_folder", async (req, res) => {
  try {
    const { mainFolderName } = req.body;
    if (!mainFolderName) {
      return res.status(400).json({ message: "mainFolderName is required." });
    }
    let mainFolder = await findFolder(mainFolderName);
    if (!mainFolder) {
      mainFolder = await createFolder(mainFolderName);
    }
    res.status(200).json({ message: "Main folder ready", folder: mainFolder });
  } catch (error) {
    console.error("Error creating main folder:", error);
    res.status(500).json({ message: "Error creating main folder." });
  }
});

/**
 * POST /api/create_student_folder
 * Creates (or retrieves) a student folder and a specific subfolder inside it.
 * In this design, the "studentId" is the student's admission number (admno).
 * Request Body Example:
 * {
 *   "mainFolderName": "The Uniques 2.0",
 *   "studentId": "2022BTCS001",    // This is the admission number (admno)
 *   "subfolders": ["certificate", "achievement", "profile"]
 * }
 */
// ---------------------------------------------here alredy create folder----------------------------------------------------
// {
//   "message": "Student folder structure ready",
//   "folderStructure": {
//       "mainFolder": {
//           "id": "1zhdebSyOQKNSPOF5dBQYemoCbAtOXDW9",
//           "name": "The Uniques 2.0"
//       },
//       "studentFolder": {
//           "id": "19hXTq2o7jeqnVYpb71kUTG9rMQ9j8Trv",
//           "name": "2022BTCS001"
//       },
//       "subfolders": {
//           "profile": {
//               "id": "1uHVmSokCMntbb1EO5DAre2zJzT2MFH6I",
//               "name": "profile"
//           }
//       }
//   }
// }
// -----------------------------------------------------------------------------------------------------------
router.post("/create_student_folder", async (req, res) => {
  try {
    const { mainFolderName, studentId, subfolders } = req.body;

    if (
      !mainFolderName ||
      !studentId ||
      !subfolders ||
      !Array.isArray(subfolders) ||
      subfolders.length === 0
    ) {
      return res.status(400).json({
        message:
          "mainFolderName, studentId, and at least one subfolder are required.",
      });
    }

    const structure = await createFolderStructure(
      mainFolderName,
      studentId,
      subfolders
    );

    res.status(200).json({
      message: "Student folder structure ready",
      folderStructure: structure,
    });
  } catch (error) {
    console.error("Error creating student folder:", error);
    res.status(500).json({ message: "Error creating student folder." });
  }
});

/**
 * POST /api/add_subfolder
 * Adds a new subfolder to an existing student folder
 */
router.post("/add_subfolder", async (req, res) => {
  try {
    const { mainFolderName, studentId, subfolder } = req.body;

    if (!mainFolderName || !studentId || !subfolder) {
      return res.status(400).json({
        message: "mainFolderName, studentId, and subfolder are required.",
      });
    }

    // This will add the subfolder to the existing structure
    const structure = await createFolderStructure(mainFolderName, studentId, [
      subfolder,
    ]);

    res.status(200).json({
      message: "Subfolder added successfully",
      folderStructure: structure,
    });
  } catch (error) {
    console.error("Error adding subfolder:", error);
    res.status(500).json({ message: "Error adding subfolder." });
  }
});

/**
 * POST /api/file_upload
 * Bulk file upload endpoint.
 *
 * Expected form-data fields:
 * - mainFolderName: e.g., "The Uniques 2.0"
 * - studentId: e.g., "2022BTCS001" (this is the admission number used to create the folder)
 * - subfolder: e.g., "certificate", "achievement", or "profile"
 * - memberId: the MongoDB ObjectId of the member (for linking the file)
 * - files: one or more files (field name "files")
 *
 * Based on the subfolder name, the endpoint updates the corresponding field in the Member model:
 *   - "certificate" → push into certifications array.
 *   - "achievement" (or "achievements") → push into achievements array.
 *   - "profile" (or "profilepic") → update profilePic.
 */

// ---------------------------------------------here alredy create folder----------------------------------------------------
// {
//   "mainFolderName": "The Uniques 2.0",
//   "studentId": "2022BTCS001",
//   "subfolder": "profile",
//   "memberId": "67ca1c48f9f9fc6546ca1f6b",
//   "files":[]
// }
//------------------------THIS THE requests FOR FILE UPLOAD--------------------------------------------------------------

router.post("/file_upload", upload.array("files", 10), async (req, res) => {
  try {
    const { mainFolderName, studentId, subfolder, memberId } = req.body;
    if (
      !req.files ||
      req.files.length === 0 ||
      !mainFolderName ||
      !studentId ||
      !subfolder ||
      !memberId
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields or files." });
    }

    const folderStructure = await createFolderStructure(
      mainFolderName,
      studentId,
      [subfolder]
    );
    const targetFolderId = folderStructure.subfolders[subfolder].id;
    const uploadedFiles = [];

    // Determine which field in the Member model to update based on subfolder.
    let updateField;
    switch (subfolder.toLowerCase()) {
      case "certificate":
        updateField = "certifications";
        break;
      case "achievement":
      case "achievements":
        updateField = "achievements";
        break;
      case "profile":
      case "profilepic":
        updateField = "profilePic";
        break;
      default:
        updateField = null;
    }

    // Process each file
    for (const file of req.files) {
      try {
        // Upload the file to Google Drive
        const fileUploadResult = await uploadFile(file.path, targetFolderId, {
          studentId,
          category: subfolder,
          customPrefix: file.originalname.substring(0, 15).replace(/[^a-zA-Z0-9-_]/g, '')
        });

        // Update Member document based on updateField
        if (updateField) {
          if (updateField === "profilePic") {
            // For non-array fields like profilePic, check if an entry already exists
            const member = await Member.findById(memberId);

            if (member && member.profilePic) {
              // Update existing File document instead of creating a new one
              await File.findByIdAndUpdate(
                member.profilePic,
                {
                  fileName: fileUploadResult.fileName,
                  fileUrl: fileUploadResult.fileUrl,
                  fileId: fileUploadResult.fileId,
                  fileOwner: memberId,
                },
                { new: true }
              );

              // No need to update member since reference remains the same
              console.log(`Updated existing File record: ${member.profilePic}`);
              uploadedFiles.push({
                ...fileUploadResult,
                _id: member.profilePic,
                updated: true,
              });
            } else {
              // Create new File document (original behavior)
              const fileRecord = new File({
                fileName: fileUploadResult.fileName,
                fileUrl: fileUploadResult.fileUrl,
                fileId: fileUploadResult.fileId,
                fileOwner: memberId,
              });
              await fileRecord.save();

              // Update member with new file reference
              await Member.findByIdAndUpdate(memberId, {
                [updateField]: fileRecord._id,
              });

              uploadedFiles.push({
                ...fileUploadResult,
                _id: fileRecord._id,
                new: true,
              });
            }
          } else {
            // For array fields, keep current functionality (push new entries)
            const fileRecord = new File({
              fileName: fileUploadResult.fileName,
              fileUrl: fileUploadResult.fileUrl,
              fileId: fileUploadResult.fileId,
              fileOwner: memberId,
            });
            await fileRecord.save();

            // Push file record reference to array
            await Member.findByIdAndUpdate(memberId, {
              $push: { [updateField]: fileRecord._id },
            });

            uploadedFiles.push({
              ...fileUploadResult,
              _id: fileRecord._id,
            });
          }
        } else {
          // No specified field to update, just save the file
          const fileRecord = new File({
            fileName: fileUploadResult.fileName,
            fileUrl: fileUploadResult.fileUrl,
            fileId: fileUploadResult.fileId,
            fileOwner: memberId,
          });
          await fileRecord.save();
          uploadedFiles.push({
            ...fileUploadResult,
            _id: fileRecord._id,
          });
        }
      } catch (fileError) {
        console.error("Error processing file:", file.filename, fileError);
      } finally {
        // Always remove the temporary file
        try {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path); // Use synchronous delete for reliability
            console.log(`Successfully removed temp file: ${file.path}`);
          }
        } catch (unlinkError) {
          console.error("Error deleting temp file:", file.path, unlinkError);
        }
      }
    }

    res.status(200).json({
      message: "Files uploaded successfully.",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Error in file upload:", error);
    res.status(500).json({ message: "Error during file upload." });
  }
});


/**
 * POST /api/event_file_upload
 * Uploads files for events and manages references.
 * 
 * Expected form-data:
 * - eventName: Name of the event (used for folder creation)
 * - eventId: (optional) MongoDB ID of event to update
 * - fileKey: Key/field name in event model that contains file reference
 * - files: One or more files to upload
 */
router.post("/event_file_upload", upload.array("files", 10), async (req, res) => {
  const tempFiles = req.files || [];

  try {
    const { eventName, eventId, fileKey, replaceGallery } = req.body;
    const mainFolderName = "The Uniques Event";

    if (tempFiles.length === 0 || !eventName || !fileKey) {
      return res.status(400).json({
        message: "Missing required fields or files."
      });
    }

    // Check if fileKey is valid based on event schema
    const validFileKeys = ['eventBanner', 'eventGallery'];
    if (!validFileKeys.includes(fileKey)) {
      return res.status(400).json({
        message: `Invalid fileKey. Must be one of: ${validFileKeys.join(', ')}`
      });
    }

    // Create folder structure: Main Folder -> Event Folder
    const folderStructure = await createFolderStructure(
      mainFolderName,
      eventName,
      ["files"] // Use a generic subfolder
    );

    const targetFolderId = folderStructure.subfolders["files"].id;
    const uploadedFiles = [];

    // Handle files based on whether we have an event ID
    if (eventId) {
      // Find the event
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          message: `Event with ID ${eventId} not found`
        });
      }

      // Process based on fileKey type
      if (fileKey === 'eventBanner') {
        // Single file reference - use first file only
        if (tempFiles.length > 1) {
          console.warn(`Multiple files uploaded for banner, using only the first one`);
        }

        const file = tempFiles[0];
        const fileUploadResult = await uploadFile(file.path, targetFolderId, {
          eventName,
          category: "event-banner",
          customPrefix: file.originalname.substring(0, 15).replace(/[^a-zA-Z0-9-_]/g, '')
        });

        if (event.eventBanner) {
          // Update existing File document
          await File.findByIdAndUpdate(
            event.eventBanner,
            {
              fileName: fileUploadResult.fileName,
              fileUrl: fileUploadResult.fileUrl,
              fileId: fileUploadResult.fileId,
              lastUpdated: new Date()
            },
            { new: true }
          );

          uploadedFiles.push({
            ...fileUploadResult,
            _id: event.eventBanner,
            type: "banner",
            status: "updated"
          });
        } else {
          // Create new File document
          const fileRecord = new File({
            fileName: fileUploadResult.fileName,
            fileUrl: fileUploadResult.fileUrl,
            fileId: fileUploadResult.fileId,
            eventId: eventId,
            fileType: "event-banner"
          });
          await fileRecord.save();

          // Update event
          await Event.findByIdAndUpdate(eventId, {
            eventBanner: fileRecord._id
          });

          uploadedFiles.push({
            ...fileUploadResult,
            _id: fileRecord._id,
            type: "banner",
            status: "created"
          });
        }
      }
      else if (fileKey === 'eventGallery') {
        // Array field - handle multiple files
        if (replaceGallery === 'true') {
          // Clear existing gallery if replace option is set
          // First get existing gallery items
          const existingGallery = event.eventGallery || [];

          // Delete all file references
          if (existingGallery.length > 0) {
            await File.deleteMany({ _id: { $in: existingGallery } });
          }

          // Clear gallery array in event
          await Event.findByIdAndUpdate(eventId, { eventGallery: [] });
        }

        // Upload all new files
        for (const file of tempFiles) {
          const fileUploadResult = await uploadFile(file.path, targetFolderId, {
            eventName,
            category: "event-gallery",
            customPrefix: file.originalname.substring(0, 15).replace(/[^a-zA-Z0-9-_]/g, '')
          });

          // Create new File document
          const fileRecord = new File({
            fileName: fileUploadResult.fileName,
            fileUrl: fileUploadResult.fileUrl,
            fileId: fileUploadResult.fileId,
            eventId: eventId,
            fileType: "event-gallery"
          });
          await fileRecord.save();

          // Add to event gallery
          await Event.findByIdAndUpdate(eventId, {
            $push: { eventGallery: fileRecord._id }
          });

          uploadedFiles.push({
            ...fileUploadResult,
            _id: fileRecord._id,
            type: "gallery",
            status: "added"
          });
        }
      }
    } else {
      // No event ID, just upload files without linking
      for (const file of tempFiles) {
        const fileUploadResult = await uploadFile(file.path, targetFolderId, {
          eventName,
          category: fileKey === 'eventBanner' ? "event-banner" : "event-gallery",
          customPrefix: file.originalname.substring(0, 15).replace(/[^a-zA-Z0-9-_]/g, '')
        });

        // Create file record
        const fileRecord = new File({
          fileName: fileUploadResult.fileName,
          fileUrl: fileUploadResult.fileUrl,
          fileId: fileUploadResult.fileId,
          relatedTo: "event",
          relatedName: eventName,
          fileType: fileKey === 'eventBanner' ? "event-banner" : "event-gallery"
        });
        await fileRecord.save();

        uploadedFiles.push({
          ...fileUploadResult,
          _id: fileRecord._id,
          type: fileKey === 'eventBanner' ? "banner" : "gallery",
          status: "unlinked"
        });
      }
    }

    // Send response
    res.status(200).json({
      message: eventId
        ? `Event ${fileKey} updated successfully`
        : `Files uploaded successfully (unlinked)`,
      files: uploadedFiles,
      count: uploadedFiles.length,
      eventId: eventId || null,
      eventName: eventName,
      fileKey: fileKey
    });
  } catch (error) {
    console.error("Error in event file upload:", error);
    res.status(500).json({
      message: "Error during event file upload.",
      error: error.message
    });
  } finally {
    // Clean up all temporary files
    tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.error("Error deleting temp file:", file.path, err);
      }
    });
  }
});

router.post("/budget_file_upload", upload.single("file"), async (req, res) => {
  const tempFile = req.file;

  try {
    const { eventId, itemType, itemId } = req.body;

    if (!tempFile || !eventId || !itemType || !itemId) {
      return res.status(400).json({
        message: "Missing required fields or file."
      });
    }

    // Validate itemType
    if (!["expense", "sponsor"].includes(itemType)) {
      return res.status(400).json({
        message: "Invalid itemType. Must be 'expense' or 'sponsor'."
      });
    }

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        message: `Event with ID ${eventId} not found`
      });
    }

    // Find the specific item (expense or sponsorship)
    let itemArray = itemType === "expense" ? event.expenses : event.sponsors;
    const itemIndex = itemArray.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({
        message: `${itemType} with ID ${itemId} not found in event`
      });
    }

    const currentItem = itemArray[itemIndex];
    const itemAmount = currentItem.amount || 0;

    // Create folder structure: Main Folder -> Event Folder -> Budget -> ItemType
    const folderStructure = await createFolderStructure(
      "The Uniques Event",
      event.eventName,
      ["budget", itemType]
    );

    const targetFolderId = folderStructure.subfolders[itemType].id;

    // Upload file to Google Drive
    const fileUploadResult = await uploadFile(tempFile.path, targetFolderId, {
      eventName: event.eventName,
      category: `${itemType}-receipt`,
      customPrefix: `${itemType}-${itemId.substring(0, 8)}`
    });

    // Create file record
    const fileRecord = new File({
      fileName: fileUploadResult.fileName,
      fileUrl: fileUploadResult.fileUrl,
      fileId: fileUploadResult.fileId,
      eventId: eventId,
      fileType: `${itemType}-receipt`,
      relatedId: itemId
    });
    await fileRecord.save();

    // Update the event item with receipt reference
    const updatePath = `${itemType}s.${itemIndex}.receiptId`;
    const updateObj = { [updatePath]: fileRecord._id };

    // Initialize budget updates object
    const budgetUpdates = {};

    // Update budget totals based on item type
    if (itemType === "sponsor" && currentItem.receivedStatus !== "received") {
      // This is a new sponsorship being marked as received
      updateObj[`${itemType}s.${itemIndex}.receivedStatus`] = "received";
      updateObj[`${itemType}s.${itemIndex}.dateReceived`] = new Date();

      // Update budget totals - increase total allocation/income
      const currentAllocation = event.budget?.totalAllocation || 0;
      budgetUpdates["budget.totalAllocation"] = currentAllocation + itemAmount;
    }
    else if (itemType === "expense" && currentItem.paymentStatus !== "completed") {
      // This is a new expense being marked as completed
      updateObj[`${itemType}s.${itemIndex}.paymentStatus`] = "completed";
      updateObj[`${itemType}s.${itemIndex}.paidOn`] = new Date();

      // Update budget totals - increase total spent
      const currentSpent = event.budget?.totalSpent || 0;
      budgetUpdates["budget.totalSpent"] = currentSpent + itemAmount;
    }

    // Calculate remaining budget
    if (Object.keys(budgetUpdates).length > 0) {
      const updatedAllocation =
        budgetUpdates["budget.totalAllocation"] !== undefined
          ? budgetUpdates["budget.totalAllocation"]
          : (event.budget?.totalAllocation || 0);

      const updatedSpent =
        budgetUpdates["budget.totalSpent"] !== undefined
          ? budgetUpdates["budget.totalSpent"]
          : (event.budget?.totalSpent || 0);

      budgetUpdates["budget.remaining"] = updatedAllocation - updatedSpent;
    }

    // Merge all updates
    const finalUpdateObj = { ...updateObj, ...budgetUpdates };

    // Update the event with all changes
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      finalUpdateObj,
      { new: true }
    );

    // Send response
    res.status(200).json({
      message: `Receipt uploaded and ${itemType} updated successfully`,
      file: {
        ...fileUploadResult,
        _id: fileRecord._id,
      },
      eventId: eventId,
      itemType: itemType,
      itemId: itemId,
      status: itemType === "sponsor" ? "received" : "completed",
      budget: updatedEvent.budget
    });

  } catch (error) {
    console.error(`Error in budget file upload:`, error);
    res.status(500).json({
      message: `Error during budget file upload.`,
      error: error.message
    });
  } finally {
    // Clean up temporary file
    try {
      if (fs.existsSync(tempFile.path)) {
        fs.unlinkSync(tempFile.path);
      }
    } catch (err) {
      console.error("Error deleting temp file:", tempFile.path, err);
    }
  }
});

/**
 * POST /upload/fine_file_upload
 * Uploads files related to fines without updating fine status
 * 
 * Expected form-data:
 * - memberId: MongoDB ID of the member
 * - fineId: ID of the fine in member.fines array
 * - fileType: Type of file (receipt, proof, waiver, other)
 * - files: One or more files to upload
 */
router.post("/fine_file_upload", upload.array("files", 5), async (req, res) => {
  const tempFiles = req.files || [];

  try {
    const { memberId, fineId, fileType } = req.body;
    const mainFolderName = "The Uniques Fines";

    if (tempFiles.length === 0 || !memberId || !fileType) {
      return res.status(400).json({
        message: "Missing required fields or files."
      });
    }

    // Validate member ID
    if (!mongoose.Types.ObjectId.isValid(memberId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid member ID format'
      });
    }

    // Valid file types for fines
    const validFileTypes = ['receipt', 'proof', 'waiver', 'other'];
    if (!validFileTypes.includes(fileType)) {
      return res.status(400).json({
        message: `Invalid fileType. Must be one of: ${validFileTypes.join(', ')}`
      });
    }

    // Get member information for folder naming
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({
        message: `Member with ID ${memberId} not found`
      });
    }

    const memberName = member.fullName || member.admno || memberId;
    const fineFolderName = fineId ? `fine-${fineId.substring(0, 8)}` : `fine-${Date.now()}`;

    // Create folder structure: Main Folder -> MemberName -> Fine-ID
    const folderStructure = await createFolderStructure(
      mainFolderName,
      memberName,
      [fineFolderName]
    );

    const targetFolderId = folderStructure.subfolders[fineFolderName].id;
    const uploadedFiles = [];

    // Upload all files
    for (const file of tempFiles) {
      const fileUploadResult = await uploadFile(file.path, targetFolderId, {
        memberId,
        fineId,
        category: `fine-${fileType}`,
        customPrefix: `${fileType}-${file.originalname.substring(0, 15).replace(/[^a-zA-Z0-9-_]/g, '')}`
      });

      // Create new File document
      const fileRecord = new File({
        fileName: fileUploadResult.fileName,
        fileUrl: fileUploadResult.fileUrl,
        fileId: fileUploadResult.fileId,
        fileType: `fine-${fileType}`,
        relatedTo: "fine",
        relatedId: fineId || null,
        fileOwner: memberId
      });
      await fileRecord.save();

      uploadedFiles.push({
        ...fileUploadResult,
        _id: fileRecord._id,
        type: fileType
      });
    }

    // Send response with file data that can be used in subsequent requests
    res.status(200).json({
      success: true,
      message: `File(s) uploaded successfully`,
      files: uploadedFiles,
      count: uploadedFiles.length,
      fineId: fineId,
      memberId: memberId,
      fileType: fileType
    });
  } catch (error) {
    console.error("Error in fine file upload:", error);
    res.status(500).json({
      success: false,
      message: "Error during fine file upload.",
      error: error.message
    });
  } finally {
    // Clean up all temporary files
    tempFiles.forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      } catch (err) {
        console.error("Error deleting temp file:", file.path, err);
      }
    });
  }
});


/**
 * POST /api/trainer_file_upload
 * Uploads files for trainers and updates their profile picture.
 * 
 * Expected form-data:
 * - trainerName: Name of the trainer (used for folder creation)
 * - trainerId: MongoDB ID of the trainer
 * - file: The image file to upload
 */
router.post("/trainer_file_upload", upload.single("file"), async (req, res) => {
  const tempFile = req.file;

  try {
    const { trainerName, trainerId } = req.body;
    const mainFolderName = "The Uniques Trainers";

    if (!tempFile || !trainerName || !trainerId) {
      return res.status(400).json({
        message: "Missing required fields or file."
      });
    }

    // Find the trainer
    const trainer = await Trainer.findById(trainerId);
    if (!trainer) {
      return res.status(404).json({
        message: `Trainer with ID ${trainerId} not found`
      });
    }

    // Create folder structure: Main Folder -> Trainer Folder
    const folderStructure = await createFolderStructure(
      mainFolderName,
      trainerName,
      ["profile"]
    );

    const targetFolderId = folderStructure.subfolders["profile"].id;

    // Upload file to Google Drive
    const fileUploadResult = await uploadFile(tempFile.path, targetFolderId, {
      trainerName,
      category: "trainer-profile",
      customPrefix: tempFile.originalname.substring(0, 15).replace(/[^a-zA-Z0-9-_]/g, '')
    });

    if (trainer.profilePic) {
      // Check if profilePic is an ID string or object
      const profilePicId = typeof trainer.profilePic === 'object' ? trainer.profilePic._id : trainer.profilePic;
      
      // Update existing File document
      await File.findByIdAndUpdate(
        profilePicId,
        {
          fileName: fileUploadResult.fileName,
          fileUrl: fileUploadResult.fileUrl,
          fileId: fileUploadResult.fileId,
          lastUpdated: new Date()
        },
        { new: true }
      );
    } else {
      // Create new File document
      const fileRecord = new File({
        fileName: fileUploadResult.fileName,
        fileUrl: fileUploadResult.fileUrl,
        fileId: fileUploadResult.fileId,
        relatedTo: "trainer",
        relatedId: trainerId,
        fileType: "trainer-profile"
      });
      await fileRecord.save();

      // Update trainer
      await Trainer.findByIdAndUpdate(trainerId, {
        profilePic: fileRecord._id
      });
    }

    // Send response
    res.status(200).json({
      message: `Trainer profile picture updated successfully`,
      file: {
        ...fileUploadResult,
        _id: trainer.profilePic || "new_id", 
      },
      trainerId: trainerId,
      trainerName: trainerName
    });

  } catch (error) {
    console.error("Error in trainer file upload:", error);
    res.status(500).json({
      message: "Error during trainer file upload.",
      error: error.message
    });
  } finally {
    // Clean up temporary file
    try {
      if (fs.existsSync(tempFile.path)) {
        fs.unlinkSync(tempFile.path);
      }
    } catch (err) {
      console.error("Error deleting temp file:", tempFile.path, err);
    }
  }
});

export default router;