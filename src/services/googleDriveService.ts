/**
 * Google Drive Export & Backup Service
 * Allows creating structured JSON/CSV snapshots and saving to Google Drive / Local Storage
 */

export interface SchoolBackupBundle {
  version: string;
  exportedAt: string;
  schoolName: string;
  academicYear: number;
  data: {
    schoolProfile: any;
    students: any[];
    teachers: any[];
    classes: any[];
    fees: any[];
    receipts: any[];
    events: any[];
    gradebook: any;
    attendanceRecords: any[];
    messages: any[];
  };
}

/**
 * Generates a full timestamped JSON bundle of the school's complete database
 */
export function generateSchoolBackupBundle(schoolState: {
  schoolProfile: any;
  students: any[];
  teachers: any[];
  classes: any[];
  fees: any[];
  receipts: any[];
  events: any[];
  gradebook: any;
  attendanceRecords: any[];
  messages: any[];
}): SchoolBackupBundle {
  return {
    version: "2.0-zambian-ecz",
    exportedAt: new Date().toISOString(),
    schoolName: schoolState.schoolProfile?.name || "Zambian School",
    academicYear: schoolState.schoolProfile?.academicYear || 2026,
    data: {
      schoolProfile: schoolState.schoolProfile,
      students: schoolState.students,
      teachers: schoolState.teachers,
      classes: schoolState.classes,
      fees: schoolState.fees,
      receipts: schoolState.receipts,
      events: schoolState.events,
      gradebook: schoolState.gradebook,
      attendanceRecords: schoolState.attendanceRecords,
      messages: schoolState.messages
    }
  };
}

/**
 * Downloads backup JSON bundle to device
 */
export function downloadBackupJson(bundle: SchoolBackupBundle): void {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bundle, null, 2));
  const downloadAnchor = document.createElement('a');
  const filename = `zambia-school-backup-${(bundle.schoolName || "school").toLowerCase().replace(/[^a-z0-9]/g, '-')}-${new Date().toISOString().slice(0,10)}.json`;
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Opens Google Drive Web upload directly so user can drop or save the backup in one click
 */
export function openGoogleDriveUpload(): void {
  window.open("https://drive.google.com/drive/u/0/my-drive", "_blank");
}
