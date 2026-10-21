/**
 * @file memberStatus.js
 * @description Utility functions for dynamic member status, admission year, and graduation year calculation.
 */

/**
 * Derives the admission year from member record.
 * Checks member.admissionYear, then 4-digit prefix in member.admno,
 * then falls back to batch name (e.g., 'The Uniques 1.0' -> 2021).
 *
 * @param {Object} member - Member / User document or object
 * @returns {number|null} 4-digit admission year
 */
export const getMemberAdmissionYear = (member) => {
  if (!member) return null;

  if (typeof member.admissionYear === "number" && !isNaN(member.admissionYear)) {
    return member.admissionYear;
  }

  // Extract from admno (format: YYYYxxxxxxx, e.g. 2023BTCS232)
  if (member.admno && typeof member.admno === "string") {
    const match = member.admno.trim().match(/^(\d{4})/);
    if (match) {
      const year = parseInt(match[1], 10);
      if (year >= 2000 && year <= 2100) {
        return year;
      }
    }
  }

  // Fallback: Parse batch (e.g. "The Uniques 1.0" -> 2021, "The Uniques 2.0" -> 2022)
  if (member.batch && typeof member.batch === "string") {
    const match = member.batch.match(/(\d+)(?:\.\d+)?/);
    if (match) {
      const batchNum = parseInt(match[1], 10);
      if (batchNum >= 1 && batchNum <= 50) {
        return 2020 + batchNum;
      }
    }
  }

  // Secondary fallback: createdAt year
  if (member.createdAt) {
    const createdYear = new Date(member.createdAt).getFullYear();
    if (!isNaN(createdYear)) {
      return createdYear;
    }
  }

  return null;
};

/**
 * Checks whether member is enrolled in BCA.
 *
 * @param {Object} member - Member / User document or object
 * @returns {boolean}
 */
export const isBcaStudent = (member) => {
  if (!member) return false;
  if (member.course === "BCA") return true;
  if (typeof member.admno === "string" && /BCA/i.test(member.admno)) return true;
  return false;
};

/**
 * Computes graduation year based on admission year and course duration:
 * - BCA: 3 years
 * - B.Tech / CSD / AI/ML: 4 years
 *
 * @param {Object} member - Member / User document or object
 * @returns {number|null} 4-digit graduation year
 */
export const getMemberGraduationYear = (member) => {
  if (!member) return null;

  if (typeof member.graduationYear === "number" && !isNaN(member.graduationYear)) {
    return member.graduationYear;
  }

  const admissionYear = getMemberAdmissionYear(member);
  if (!admissionYear) return null;

  const durationYears = isBcaStudent(member) ? 3 : 4;
  return admissionYear + durationYears;
};

/**
 * Calculates member status on the fly.
 * - Suspended members return 'suspended'
 * - Active if before July 1st of the graduation year
 * - Inactive (graduated) on or after July 1st of the graduation year
 *
 * @param {Object} member - Member / User document or object
 * @param {Date} [asOfDate=new Date()] - Reference date for calculation
 * @returns {'active'|'inactive'|'suspended'}
 */
export const calculateMemberStatus = (member, asOfDate = new Date()) => {
  if (!member) return "inactive";

  if (member.isSuspended) {
    return "suspended";
  }

  const gradYear = getMemberGraduationYear(member);
  if (!gradYear) {
    return "active";
  }

  // Graduation cutoff is July 1st of the graduation year (0-indexed month 6)
  const graduationDate = new Date(gradYear, 6, 1, 0, 0, 0, 0);

  if (asOfDate >= graduationDate) {
    return "inactive";
  }

  return "active";
};
