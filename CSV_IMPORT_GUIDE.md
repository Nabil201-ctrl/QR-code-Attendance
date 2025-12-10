# CSV Student Import Guide

## How to Import Students Using CSV

### Step-by-Step Instructions

#### 1. **Prepare Your CSV File**

Your CSV file must have exactly these two column headers:
```csv
name,matricNumber
```

#### 2. **CSV Format Example**

```csv
name,matricNumber
John Doe,2021001
Jane Smith,2021002
Michael Johnson,2021003
Emily Brown,2021004
David Wilson,2021005
```

#### 3. **Important Rules**

- ✅ **Required Headers**: The first row must be `name,matricNumber`
- ✅ **Case Sensitive**: Use lowercase headers exactly as shown
- ✅ **No Extra Columns**: Only include `name` and `matricNumber` columns
- ✅ **Unique Matric Numbers**: Each matricNumber must be unique (duplicates will be skipped)
- ✅ **No Empty Rows**: All rows must have both name and matricNumber filled

#### 4. **Creating a CSV File**

##### Option A: Using Microsoft Excel
1. Open Excel
2. Create a spreadsheet with headers: `name` and `matricNumber`
3. Fill in student data
4. Go to **File → Save As**
5. Choose **CSV (Comma delimited) (*.csv)** as file type
6. Save the file

##### Option B: Using Google Sheets
1. Open Google Sheets
2. Create a spreadsheet with headers: `name` and `matricNumber`
3. Fill in student data
4. Go to **File → Download → Comma Separated Values (.csv)**

##### Option C: Using a Text Editor
1. Open any text editor (Notepad, VS Code, etc.)
2. Type the headers: `name,matricNumber`
3. Add student data on new lines
4. Save with `.csv` extension

#### 5. **Upload Process**

1. Navigate to the **Add Student** page in the admin panel
2. Scroll down to the "Or Upload Multiple Students via CSV" section
3. Click **"Download Sample CSV"** if you need a template
4. Click **"Choose File"** or **"Browse"** to select your CSV file
5. Click **"Upload CSV and Add Students"**
6. Wait for the success message showing how many students were added

#### 6. **Understanding Upload Results**

After uploading, you'll see a message like:
```
Success: Created 15 students. 3 duplicates skipped.
```

This means:
- **15 new students** were successfully added to the system
- **3 students** were skipped because their matric numbers already exist in the database

#### 7. **Troubleshooting**

| Error | Solution |
|-------|----------|
| "Failed to upload students" | Check that your CSV has the correct headers |
| "No file uploaded" | Make sure you selected a file before clicking upload |
| "Duplicates skipped" | Some matric numbers already exist in the database |
| File not recognized | Ensure file extension is `.csv`, not `.xlsx` or `.txt` |

#### 8. **Sample CSV File**

A sample CSV file named `sample-students.csv` is included in the project root directory. You can:
- Download it from the admin panel using the "Download Sample CSV" button
- Copy it from the project folder
- Use it as a template for your own student list

#### 9. **Best Practices**

- ✅ Test with a small CSV file first (2-3 students)
- ✅ Backup your data before bulk uploads
- ✅ Use consistent formatting for names (e.g., "First Last")
- ✅ Use numeric-only matric numbers or consistent format (e.g., "2021001")
- ✅ Remove any special characters or extra spaces
- ✅ Check for duplicate matric numbers before uploading

#### 10. **Video Tutorial** (Coming Soon)

For a visual guide, watch our step-by-step video tutorial on how to create and upload CSV files.

---

## Technical Details

### Backend Processing

The backend processes CSV files with these steps:
1. Receives the uploaded file
2. Parses CSV using the `csv-parser` library
3. Validates each row for required fields
4. Checks for existing matric numbers
5. Creates new students and tracks duplicates
6. Returns summary of created and skipped students

### Supported CSV Formats

- **Character Encoding**: UTF-8
- **Line Endings**: Windows (CRLF) or Unix (LF)
- **Delimiter**: Comma (,)
- **Quote Character**: Double quotes (") for names with commas

### Example with Special Characters

```csv
name,matricNumber
"Johnson, Michael",2021001
"O'Brien, Patrick",2021002
María García,2021003
```

---

## Need Help?

If you encounter any issues with CSV upload:
1. Check the browser console for detailed error messages
2. Verify your CSV format matches the template exactly
3. Ensure the backend server is running
4. Check that MongoDB connection is active
