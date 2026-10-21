/**
 * @file memberStatus.js
 * @description Frontend utility functions for member status, graduation year, and badge styling.
 */

/**
 * Checks whether member is enrolled in BCA.
 *
 * @param {Object} member
 * @returns {boolean}
 */
export const isBcaStudent = (member) => {
  if (!member) return false;
  if (member.course === "BCA") return true;
  if (typeof member.admno === "string" && /BCA/i.test(member.admno)) return true;
  return false;
};

/**
 * Extracts admission year from member record.
 *
 * @param {Object} member
 * @returns {number|null}
 */
export const getMemberAdmissionYear = (member) => {
  if (!member) return null;

  if (typeof member.admissionYear === "number" && !isNaN(member.admissionYear)) {
    return member.admissionYear;
  }

  // Extract from admno (e.g. 2023BTCS232 -> 2023)
  if (member.admno && typeof member.admno === "string") {
    const match = member.admno.trim().match(/^(\d{4})/);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 2000 && year <= 2100) {
        return year;
      }
    }
  }

  // Fallback to batch (e.g. "The Uniques 1.0" -> 2021)
  if (member.batch && typeof member.batch === "string") {
    const match = member.batch.match(/(\d+)(?:\.\d+)?/);
    if (match) {
      const batchNum = parseInt(match[1], 10);
      if (batchNum >= 1 && batchNum <= 50) {
        return 2020 + batchNum;
      }
    }
  }

  return null;
};

/**
 * Derives graduation year:
 * - BCA: 3 years
 * - Others: 4 years
 *
 * @param {Object} member
 * @returns {number|null}
 */
export const getMemberGraduationYear = (member) => {
  if (!member) return null;

  if (typeof member.graduationYear === "number" && !isNaN(member.graduationYear)) {
    return member.graduationYear;
  }

  const admYear = getMemberAdmissionYear(member);
  if (!admYear) return null;

  const durationYears = isBcaStudent(member) ? 3 : 4;
  return admYear + durationYears;
};

/**
 * Computes member status on the fly.
 * Respects suspension/blocking, then checks July 1st cutoff of graduation year.
 *
 * @param {Object} member
 * @param {Date} [asOfDate=new Date()]
 * @returns {'active'|'inactive'|'suspended'}
 */
export const getMemberStatus = (member, asOfDate = new Date()) => {
  if (!member) return "inactive";

  if (member.isSuspended) {
    return "suspended";
  }

  // If already calculated and provided by API virtual
  if (member.status && (member.status === "active" || member.status === "inactive" || member.status === "suspended")) {
    return member.status;
  }

  const gradYear = getMemberGraduationYear(member);
  if (!gradYear) {
    return "active";
  }

  // Cutoff is July 1st of the graduation year (0-indexed month 6)
  const graduationDate = new Date(gradYear, 6, 1, 0, 0, 0, 0);

  if (asOfDate >= graduationDate) {
    return "inactive";
  }

  return "active";
};

/**
 * Returns badge label, class names, and theme colors for member status.
 *
 * @param {string} status - 'active' | 'inactive' | 'suspended' | 'blocked'
 * @returns {{ label: string, className: string, color: 'success' | 'default' | 'error' }}
 */
export const getMemberStatusBadgeProps = (status) => {
  const normalized = (status || "").toLowerCase();

  switch (normalized) {
    case "active":
      return {
        label: "ACTIVE",
        className:
          "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40",
        color: "success",
      };
    case "suspended":
    case "blocked":
      return {
        label: "BLOCKED",
        className:
          "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300 border border-red-300/40",
        color: "error",
      };
    case "inactive":
    default:
      return {
        label: "INACTIVE",
        className:
          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300/40",
        color: "default",
      };
  }
};
