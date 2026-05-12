// import Event from "../models/member/eventModel.js";

// // Check user permissions middleware
// const checkUserPermissions = (req, res, next) => {
//   const { role } = req.user;
  
//   // Store role in request for later use
//   req.userRole = role;
  
//   if (role !== 'admin' && role !== 'coordinator') {
//     return res.status(403).json({ 
//       success: false, 
//       message: "You don't have permission to manage budgets" 
//     });
//   }
  
//   next();
// };

// // Get budget details
// export const getEventBudget = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const event = await Event.findById(id).select('budget sponsors expenses budgetAllocations');
    
//     if (!event) {
//       return res.status(404).json({ success: false, message: "Event not found" });
//     }
    
//     res.status(200).json({ success: true, data: event });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Update total budget
// export const updateBudget = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { totalAllocated, currency, note } = req.body;
//     const { _id: userId, role } = req.user;
    
//     const event = await Event.findById(id);
    
//     if (!event) {
//       return res.status(404).json({ success: false, message: "Event not found" });
//     }
    
//     const previousAmount = event.budget.totalAllocated;
    
//     // Update budget
//     event.budget.totalAllocated = totalAllocated;
//     event.budget.currency = currency;
//     event.budget.lastUpdatedBy = {
//       userId,
//       role,
//       timestamp: new Date()
//     };
    
//     // Add history record
//     event.budgetHistory.push({
//       action: "updated",
//       amount: totalAllocated,
//       previousAmount,
//       note,
//       performedBy: {
//         userId,
//         role
//       }
//     });
    
//     await event.save();
    
//     res.status(200).json({ success: true, data: event.budget });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Add sponsor
// export const addSponsor = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const sponsorData = req.body;
//     const { _id: userId, role } = req.user;
    
//     const event = await Event.findById(id);
    
//     if (!event) {
//       return res.status(404).json({ success: false, message: "Event not found" });
//     }
    
//     // Add sponsor
//     event.sponsors.push({
//       ...sponsorData,
//       dateReceived: new Date()
//     });
    
//     // Add history record
//     event.budgetHistory.push({
//       action: "updated",
//       amount: sponsorData.amount,
//       note: `Added sponsor: ${sponsorData.name}`,
//       performedBy: {
//         userId,
//         role
//       }
//     });
    
//     await event.save();
    
//     res.status(201).json({ success: true, data: event.sponsors });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Add expense
// export const addExpense = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const expenseData = req.body;
//     const { _id: userId, role } = req.user;
    
//     const event = await Event.findById(id);
    
//     if (!event) {
//       return res.status(404).json({ success: false, message: "Event not found" });
//     }
    
//     // Calculate new totalSpent if expense is completed
//     if (expenseData.paymentStatus === 'completed') {
//       event.budget.totalSpent += expenseData.amount;
//     }
    
//     // Add expense with user info
//     const newExpense = {
//       ...expenseData,
//       createdBy: {
//         userId,
//         role
//       }
//     };
    
//     event.expenses.push(newExpense);
    
//     // Add history record
//     event.budgetHistory.push({
//       action: "expense_added",
//       amount: expenseData.amount,
//       category: expenseData.category,
//       note: `Added expense: ${expenseData.title}`,
//       performedBy: {
//         userId,
//         role
//       }
//     });
    
//     await event.save();
    
//     res.status(201).json({ success: true, data: event.expenses });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Add allocation
// export const addAllocation = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const allocationData = req.body;
//     const { _id: userId, role } = req.user;
    
//     // Only admin can add allocations
//     if (role !== 'admin') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Only administrators can add budget allocations" 
//       });
//     }
    
//     const event = await Event.findById(id);
    
//     if (!event) {
//       return res.status(404).json({ success: false, message: "Event not found" });
//     }
    
//     // Add allocation with user info
//     const newAllocation = {
//       ...allocationData,
//       createdBy: {
//         userId,
//         role
//       }
//     };
    
//     event.budgetAllocations.push(newAllocation);
    
//     // Add history record
//     event.budgetHistory.push({
//       action: "allocated",
//       amount: allocationData.amount,
//       category: allocationData.category,
//       note: `Added allocation for ${allocationData.category}`,
//       performedBy: {
//         userId,
//         role
//       }
//     });
    
//     await event.save();
    
//     res.status(201).json({ success: true, data: event.budgetAllocations });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Delete expense - admin only
// export const deleteExpense = async (req, res) => {
//   try {
//     const { id, expenseId } = req.params;
//     const { _id: userId, role } = req.user;
    
//     // Only admin can delete
//     if (role !== 'admin') {
//       return res.status(403).json({ 
//         success: false, 
//         message: "Only administrators can delete expenses" 
//       });
//     }
    
//     const event = await Event.findById(id);
    
//     if (!event) {
//       return res.status(404).json({ success: false, message: "Event not found" });
//     }
    
//     // Find expense
//     const expense = event.expenses.id(expenseId);
    
//     if (!expense) {
//       return res.status(404).json({ success: false, message: "Expense not found" });
//     }
    
//     // If expense was completed, subtract from total
//     if (expense.paymentStatus === 'completed') {
//       event.budget.totalSpent -= expense.amount;
//     }
    
//     // Add to history before removing
//     event.budgetHistory.push({
//       action: "expense_deleted",
//       amount: expense.amount,
//       category: expense.category,
//       note: `Deleted expense: ${expense.title}`,
//       performedBy: {
//         userId,
//         role
//       }
//     });
    
//     // Remove expense
//     expense.remove();
    
//     await event.save();
    
//     res.status(200).json({ success: true, data: event.expenses });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// // Export all functions
// export default {
//   checkUserPermissions,
//   getEventBudget,
//   updateBudget,
//   addSponsor,
//   addExpense,
//   addAllocation,
//   deleteExpense
// };


