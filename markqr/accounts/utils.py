from django.http import HttpResponse
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from django.core.mail import send_mail, BadHeaderError, EmailMessage
from django.core.exceptions import ImproperlyConfigured
from .models import Teacher, TeachAttendance
from django.conf import settings
from calendar import month_name
from datetime import datetime
from django.utils import timezone
import json
from collections import defaultdict
from django.db.models import Count
from io import BytesIO
import pandas as pd
import qrcode
import jwt
import base64
from markqr import settings


def decode_token_data(request):
    token = request.headers.get('Authorization', '').split(' ')[1]
    decoded_token = jwt.decode(token, options={"verify_signature": False})
    return decoded_token

# ----------------------------------------------------------------------------------------------------------------

def get_attendance_data():
    # Get all teachers
    teachers = Teacher.objects.all()

    # Create a dictionary to store attendance data
    attendance_data = defaultdict(dict)

    # Loop through each teacher
    for teacher in teachers:
        # Get attendance data for the teacher
        attendance_queryset = TeachAttendance.objects.filter(
            teacher=teacher
        ).values('date', 'is_present')

        # Organize attendance data by month and date
        for attendance in attendance_queryset:
            date_key = attendance['date'].strftime('%Y-%m-%d')
            is_present = attendance['is_present']

            # Extract month name from the date
            month_name_key = month_name[attendance['date'].month]

            # Create or update the structure in attendance_data
            if month_name_key not in attendance_data:
                attendance_data[month_name_key] = {}

            if teacher.user.username not in attendance_data[month_name_key]:
                attendance_data[month_name_key][teacher.user.username] = {}

            attendance_data[month_name_key][teacher.user.username][date_key] = is_present

    # Convert the attendance data to JSON format
    json_data = json.dumps(attendance_data, indent=4)
    
    return json_data
# print('json_data', get_attendance_data())


# ----------------------------------------------------------------------------------------------------------------

SERVICE_ACCOUNT_FILE = settings.SERVICE_ACCOUNT_FILE_AKHI
SCOPES = settings.SCOPES
SAMPLE_RANGE_NAME = settings.SAMPLE_RANGE_NAME_AKHI
SAMPLE_SPREADSHEET_ID = settings.SAMPLE_SPREADSHEET_ID_AKHI

def get_sheet_data(sheet_id=SAMPLE_SPREADSHEET_ID):
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    service = build('sheets', 'v4', credentials=credentials)
    sheet = service.spreadsheets()
    # vast = sheet.get(spreadsheetId=sheet_id, range=SAMPLE_RANGE_NAME).execute()
    # print(f"\nVast:{vast}\n")
    result = sheet.values().get(spreadsheetId=sheet_id, range=SAMPLE_RANGE_NAME).execute()
    values = result.get('values', [])
    # print(values)
    return values

# print('sheet_template', get_sheet_data())

# ----------------------------------------------------------------------------------------------------------------

def update_sheet_data():
    sheet_data = get_sheet_data()
    json_data = json.loads(get_attendance_data())

    headers = sheet_data[0]
    date_columns = {header: idx for idx, header in enumerate(headers) if header.isdigit()}
    # print('headers',date_columns)
    for teacher_list in sheet_data[1:]:
        teacher_name = teacher_list[0]

        if teacher_name in json_data:
            print(teacher_name)
        else:
            print('Not found')

# update_sheet_data()

# -----------------------------------------------------

def update_sheet(data):
    try:
        # Update the Google Sheet with the modified data
        credentials = service_account.Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
        service = build('sheets', 'v4', credentials=credentials)
        sheet = service.spreadsheets()
        body = {'values': data}
        result = sheet.values().update(
            spreadsheetId=SAMPLE_SPREADSHEET_ID,
            range=SAMPLE_RANGE_NAME,
            valueInputOption='RAW',
            body=body
        ).execute()
        print('Sheet updated successfully!')
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f'An error occurred: {e}')

# ----------------------------------------------------------------------------------------------------------------


def extract_names_from_sheet():
    data = get_sheet_data(SAMPLE_SPREADSHEET_ID)
    if not data or len(data) < 2:
        print('No data found or data format is incorrect.')
        return []

    header_row = data[1]
    if 'Name' not in header_row or 'Serial No' not in header_row:
        print('Name or Serial No column not found.')
        return []

    name_index = header_row.index('Name')
    serial_index = header_row.index('Serial No')

    names_and_serials = [(row[serial_index], row[name_index]) for row in data[2:] if len(row) > name_index and len(row) > serial_index]
    return names_and_serials



# def generate_qr_code(email):
#     try:
#         sheet_data = get_sheet_data(SAMPLE_SPREADSHEET_ID)
#         df = pd.DataFrame(sheet_data[1:], columns=sheet_data[0])
#         record = df[df['Email'] == email]
#         if not record.empty:
#             name = record['Name'].values[0]
#             marks = record['Marks'].values[0]
#             qr = qrcode.make(f"Name: {name}\nMarks: {marks}\nEmail: {email}")
#             with BytesIO() as buffered:
#                 qr.save(buffered)
#                 img_str = base64.b64encode(buffered.getvalue()).decode()
#             return img_str
#     except KeyError as e:
#         return None

def generate_qr_code(name):
    try:
        sheet_data = get_sheet_data(SAMPLE_SPREADSHEET_ID)
        df = pd.DataFrame(sheet_data[3:], columns=sheet_data[2])
        record = df[df['Name'] == name]
        if not record.empty:
            current_language = record['Current Language'].values[0]
            time = record['Time'].values[0]
            days = record['Days'].values[0]
            qr_data = f"Name: {name}\nCurrent Language: {current_language}\nTime: {time}\nDays: {days}"
            qr = qrcode.make(qr_data)
            with BytesIO() as buffered:
                qr.save(buffered)
                img_str = base64.b64encode(buffered.getvalue()).decode()
            return img_str
    except KeyError as e:
        return None
    

def generate_qr_code_email(email):
    try:
        qr = qrcode.make(email)
        with BytesIO() as buffered:
            qr.save(buffered)
            img_str = base64.b64encode(buffered.getvalue()).decode()
        return img_str
    except Exception as e:
        return e
    

def generate_qr_code_courses(url):
    try:
        qr = qrcode.make(url)
        with BytesIO() as buffered:
            qr.save(buffered)
            img_str = base64.b64encode(buffered.getvalue()).decode()
        return img_str
    except Exception as e:
        print(f"Error generating QR code: {str(e)}")
        return None
    

def send_course_pdf(email, course):
    subject = 'Your Course PDF'
    message = 'Please find the attached PDF file for your selected course.'
    from_email = settings.EMAIL_HOST_USER  # Use the configured sender email
    recipient_list = [email]

    courses = {
        'data_analytics': r'C:\Users\Tanmay\Documents\markqr\markqr\accounts\files\Data_Analysis_Syllabus_CADD.pdf',
        # Add more courses and their file paths as needed
    }

    file_path = courses.get(course)
    if not file_path:
        raise ImproperlyConfigured('Course PDF file path not found.')

    try:
        email = EmailMessage(
            subject=subject,
            body=message,
            from_email=from_email,
            to=recipient_list
        )
        email.attach_file(file_path)  # Attach the PDF file
        email.send(fail_silently=False)
        return True
    except BadHeaderError:
        print("Invalid header found")
    except Exception as e:
        print(f"Error sending course PDF: {str(e)}")