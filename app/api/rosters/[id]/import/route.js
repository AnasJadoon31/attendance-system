import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function POST(req, { params }) {
  const rosterId = Number(params.id);

  try {
    // Validate roster exists
    const roster = await prisma.roster.findUnique({
      where: { id: rosterId }
    });

    if (!roster) {
      return Response.json({
        success: false,
        error: 'Roster not found'
      }, { status: 404 });
    }

    const form = await req.formData();
    const file = form.get('file');

    if (!file || typeof file === 'string') {
      return Response.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Get file extension
    const fileName = file.name.toLowerCase();
    const isCSV = fileName.endsWith('.csv');
    const isXLSX = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');

    if (!isCSV && !isXLSX) {
      return Response.json({
        success: false,
        error: 'Only CSV and Excel files (.csv, .xlsx, .xls) are supported'
      }, { status: 400 });
    }

    // Read file buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    let rows = [];

    try {
      if (isCSV) {
        // For CSV files, use XLSX to parse (it handles CSV well)
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      } else {
        // For Excel files
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      }
    } catch (parseError) {
      return Response.json({
        success: false,
        error: `Failed to parse file: ${parseError.message}`
      }, { status: 400 });
    }

    if (!rows || rows.length === 0) {
      return Response.json({
        success: false,
        error: 'No data found in file or file is empty'
      }, { status: 400 });
    }

    // Parse students with flexible column mapping
    const students = rows
      .map((row, index) => {
        try {
          // Helper function to get value from various possible column names
          const getValue = (...possibleKeys) => {
            for (const key of possibleKeys) {
              const value = row[key];
              if (value !== undefined && value !== null && String(value).trim() !== '') {
                return String(value).trim();
              }
            }
            return '';
          };

          // Try different variations of enrollment number column names
          const enrollmentNumber = getValue(
            'enrollmentNumber', 'EnrollmentNumber', 'enrollment_number',
            'enrollment', 'Enrollment', 'roll', 'Roll', 'rollNumber',
            'Roll Number', 'student_id', 'studentId', 'Student ID', 'id', 'ID'
          );

          // Try different variations of name column names
          const name = getValue(
            'name', 'Name', 'studentName', 'Student Name', 'student_name',
            'fullName', 'Full Name', 'full_name'
          );

          // If name is empty, try to combine first and last names
          let finalName = name;
          if (!finalName) {
            const firstName = getValue(
              'firstName', 'First Name', 'first_name', 'fname', 'Fname'
            );
            const lastName = getValue(
              'lastName', 'Last Name', 'last_name', 'lname', 'Lname'
            );
            finalName = [firstName, lastName].filter(Boolean).join(' ').trim();
          }

          // Validate required fields
          if (!enrollmentNumber || !finalName) {
            return null;
          }

          // Extract extra fields (everything except the main fields)
          const extra = { ...row };
          const fieldsToRemove = [
            'enrollmentNumber', 'EnrollmentNumber', 'enrollment_number',
            'enrollment', 'Enrollment', 'roll', 'Roll', 'rollNumber',
            'Roll Number', 'student_id', 'studentId', 'Student ID', 'id', 'ID',
            'name', 'Name', 'studentName', 'Student Name', 'student_name',
            'fullName', 'Full Name', 'full_name',
            'firstName', 'First Name', 'first_name', 'fname', 'Fname',
            'lastName', 'Last Name', 'last_name', 'lname', 'Lname'
          ];

          fieldsToRemove.forEach(field => delete extra[field]);

          return {
            enrollmentNumber,
            name: finalName,
            extra: Object.keys(extra).length > 0 ? extra : null,
            rowIndex: index + 1
          };
        } catch (rowError) {
          console.error(`Error processing row ${index + 1}:`, rowError);
          return null;
        }
      })
      .filter(Boolean); // Remove null entries

    if (students.length === 0) {
      return Response.json({
        success: false,
        error: 'No valid student records found. Please ensure your file has columns for enrollment number and name.'
      }, { status: 400 });
    }

    // Remove duplicates (keep last occurrence)
    const uniqueStudents = Object.values(
      students.reduce((acc, student) => {
        acc[student.enrollmentNumber] = student;
        return acc;
      }, {})
    );

    // Save to database
    const results = await prisma.$transaction(async (tx) => {
      const savedStudents = [];
      const errors = [];

      for (const student of uniqueStudents) {
        try {
          const savedStudent = await tx.student.upsert({
            where: {
              rosterId_enrollmentNumber: {
                rosterId,
                enrollmentNumber: student.enrollmentNumber
              }
            },
            update: {
              name: student.name,
              extra: student.extra
            },
            create: {
              rosterId,
              name: student.name,
              enrollmentNumber: student.enrollmentNumber,
              extra: student.extra
            },
          });
          savedStudents.push(savedStudent);
        } catch (dbError) {
          errors.push({
            enrollmentNumber: student.enrollmentNumber,
            name: student.name,
            error: dbError.message
          });
        }
      }

      return { savedStudents, errors };
    });

    return Response.json({
      success: true,
      message: `Successfully imported ${results.savedStudents.length} students`,
      studentsImported: results.savedStudents.length,
      totalRows: rows.length,
      validRows: students.length,
      uniqueStudents: uniqueStudents.length,
      errors: results.errors
    });

  } catch (error) {
    console.error('Import error:', error);
    return Response.json({
      success: false,
      error: `Server error: ${error.message}`
    }, { status: 500 });
  }
}
