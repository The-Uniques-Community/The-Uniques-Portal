/**
 * @file adminData.js
 * @description Mock data fixtures representing administrative CRM metrics, enterprise deal pipelines, partner details, file attachments, and audit history.
 * @architecture Used across administrative partnership dashboards, contract detail views, and client engagement tabs.
 * @agent_note Provides structured sample records simulating an enterprise partner (e.g. Microsoft) relationship with associated contact points, documents, and negotiation milestones.
 */

/**
 * @desc Executive summary mock data comprising recent deal activities and key pipeline metrics.
 * @type {{recentActivities: Array<{date: string, title: string, description: string, type: string, icon: string}>, keyMetrics: {dealValue: string, probability: string, expectedClose: string, stage: string}}}
 */
export const summaryData = {
    recentActivities: [
      {
        date: "2024-03-15",
        title: "Contract Signed",
        description: "Agreement finalized for Q2 project scope",
        type: "success",
        icon: "📝"
      },
      {
        date: "2024-03-14",
        title: "Meeting Scheduled",
        description: "Project kickoff meeting set with stakeholders",
        type: "info",
        icon: "📅"
      },
      {
        date: "2024-03-13",
        title: "Proposal Updated",
        description: "Budget revision submitted for approval",
        type: "warning",
        icon: "💰"
      }
    ],
    keyMetrics: {
      dealValue: "$250,000",
      probability: "75%",
      expectedClose: "2024-04-30",
      stage: "Negotiation"
    }
  };
  
  /**
 * @desc Communication engagement statistics and milestone dates for administrative partner tracking.
 * @type {{engagementMetrics: {emailsExchanged: number, meetingsHeld: number, documentsShared: number, responseRate: string}, timeline: {firstContact: string, lastActivity: string, nextAction: string}}}
 */
export const analyticsData = {
    engagementMetrics: {
      emailsExchanged: 45,
      meetingsHeld: 8,
      documentsShared: 12,
      responseRate: "92%"
    },
    timeline: {
      firstContact: "2024-01-15",
      lastActivity: "2024-03-15",
      nextAction: "2024-03-20"
    }
  };
  
  /**
 * @desc Enterprise organization details and associated corporate contacts directory.
 * @type {{company: Object, contacts: Array<{name: string, role: string, email: string, phone: string}>}}
 */
export const detailsData = {
    company: {
      name: "Microsoft",
      industry: "Technology",
      size: "Enterprise",
      revenue: "$168B",
      location: "Redmond, WA",
      founded: "1975",
      employees: "221,000+",
      website: "microsoft.com"
    },
    contacts: [
      {
        name: "Jessie Caballero",
        role: "Product Manager",
        email: "michelle.rivera@example.com",
        phone: "+1 (555) 123-4567"
      },
      {
        name: "Marty C.",
        role: "Manager",
        email: "marty.c@example.com",
        phone: "+1 (555) 987-6543"
      }
    ]
  };
  
  /**
 * @desc Enterprise document repository mock fixtures (proposals, contracts, spreadsheets).
 * @type {Array<{name: string, size: string, uploadedOn: string, uploadedBy: string, type: string, status: string}>}
 */
export const filesData = [
    {
      name: "Project_Proposal_v2.pdf",
      size: "2.4 MB",
      uploadedOn: "2024-03-10",
      uploadedBy: "Jessie Caballero",
      type: "pdf",
      status: "final"
    },
    {
      name: "Contract_Draft.docx",
      size: "1.1 MB",
      uploadedOn: "2024-03-12",
      uploadedBy: "Marty C.",
      type: "word",
      status: "draft"
    },
    {
      name: "Budget_Breakdown.xlsx",
      size: "856 KB",
      uploadedOn: "2024-03-14",
      uploadedBy: "Jessie Caballero",
      type: "excel",
      status: "review"
    }
  ];
  
  /**
 * @desc Historical audit activity logs tracking agreement milestones and meetings.
 * @type {Array<{date: string, action: string, user: string, details: string, type: string}>}
 */
export const historyData = [
    {
      date: "2024-03-15",
      action: "Contract signed",
      user: "Jessie Caballero",
      details: "Final contract version approved and signed by all parties",
      type: "success"
    },
    {
      date: "2024-03-14",
      action: "Meeting held",
      user: "Marty C.",
      details: "Budget review meeting with finance team",
      type: "info"
    },
    {
      date: "2024-03-13",
      action: "Document updated",
      user: "Jessie Caballero",
      details: "Updated proposal with new pricing structure",
      type: "warning"
    }
  ];