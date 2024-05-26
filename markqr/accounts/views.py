from .utils import generate_qr_code_email, send_course_pdf, generate_qr_code_courses, extract_names_from_sheet, decode_token_data, update_sheet_data
from .serializers import NameSerializer, CustomUserCreationSerializer, TeacherAttendanceSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import render
from django.urls import reverse
from django.http import HttpResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from accounts.models import TeachAttendance, CustomUser, Teacher, CoursesPDF


user = CustomUser()

# ----------------------------------------------------------------------------------------------------------------

class CustomUserAPIView(APIView):
    def post(self, request):
        print(request)
        serializer = CustomUserCreationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ----------------------------------------------------------------------------------------------------------------

class CustomUserLoginData(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user_id = decode_token_data(request).get('user_id')
        profile_type = CustomUser.objects.filter(id=user_id).values_list('profile_type', flat=True).first()

        if profile_type == 'teacher':
            data = CustomUser.objects.filter(id=user_id).values('id', 'profile_type')
        elif profile_type == 'student':
            data = CustomUser.objects.filter(id=user_id).values('id', 'profile_type')
        else:
            data = {'message': 'Invalid profile type'}
        return Response(data)
    
# ----------------------------------------------------------------------------------------------------------------

class CustomUserData(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = decode_token_data(request).get('user_id')
        profile_type = CustomUser.objects.filter(id=user_id).values_list('profile_type', flat=True).first()

        if profile_type == 'teacher':
            data = CustomUser.objects.filter(id=user_id).values('id', 'username', 'email', 'profile_type', 'first_name', 'last_name', 'phone_number')
            teacher_data = Teacher.objects.filter(user_id=user_id).values('teacher_attendance_excel_sheet', 'student_excel_sheet')
            teacher_attendance_exists = TeachAttendance.objects.filter(teacher__user_id=user_id).exists()
            if teacher_attendance_exists:
                teacher_attendance = TeachAttendance.objects.filter(teacher__user_id=user_id).values()
            else:
                print('no teacher attendance')
                teacher_attendance = {}
            teachData = {'data': data,'Teacher_Data': teacher_data, 'Teacher_Attendance':teacher_attendance}
            # print(teachData)
        elif profile_type == 'student':
            data = {'message': 'You are a student'}
        else:
            data = {'message': 'Invalid profile type'}
        return Response(teachData)

# ----------------------------------------------------------------------------------------------------------------

class TeacherAttendance(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        print(request)
        user_id = decode_token_data(request).get('user_id')
        print(type(str(user_id)), type(request.data.get('teacher')))
        if request.data.get('teacher') == str(user_id):
            serializer = TeacherAttendanceSerializer(data=request.data)
            if serializer.is_valid():
                teacher_attendance = serializer.save()
                return Response(status=status.HTTP_201_CREATED)
            print(serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        print('userid doesnt match')
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    
# ----------------------------------------------------------------------------------------------------------------

class CoursePDFView(APIView):
    def post(self, request):
        course_name = request.data.get('course_name', None)
        print(course_name)
        if course_name is None:
            return Response({'Course name is required'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            course_pdf_obj = CoursesPDF.objects.get(course_name=course_name)
        except CoursesPDF.DoesNotExist:
            print('doesnt exist')
            return Response({'Course not found'}, status=status.HTTP_404_NOT_FOUND)
        response = HttpResponse(course_pdf_obj.course_pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{course_name}.pdf"'
        return response

# ----------------------------------------------------------------------------------------------------------------

class SyncAttendance(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        attendance_sync = update_sheet_data()
        return Response(status=status.HTTP_200_OK)


# ----------------------------------------------------------------------------------------------------------------

class RestrictedAPIView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        return Response({'message': 'You have successfully accessed the restricted view.'}, status=status.HTTP_200_OK)

# ----------------------------------------------------------------------------------------------------------------






# ----------------------------------------------------------------------------------------------------------------


class TeacherNamesAPIView(APIView):
    def get(self, request):
        names = extract_names_from_sheet()
        return Response({'teachers': names})

def home(request):
    return render(request, 'home.html')

def courses_qrcode(request):
    url = request.build_absolute_uri(reverse('courses'))
    qr = generate_qr_code_courses(url)
    return render(request, 'qrcourses.html', {'qr' : qr})

def generate_qr_code_view(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        qr = generate_qr_code_email(email)
        if qr:
            return render(request, 'home.html', {'qr': qr})
        else:
            return render(request, 'home.html', {'message': 'Email not found!'})
    return render(request, 'home.html')


def course_pdf(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        print(email)
        course = request.POST.get('course')
        send_course_pdf(email, course)
        return render(request, 'pdf.html', {'message': 'Course PDF sent to your email'})
    return render(request, 'pdf.html', {'message': 'Course PDF not found!'})
