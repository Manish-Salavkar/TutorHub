from django.urls import path
from rest_framework_simplejwt.views import TokenBlacklistView, TokenObtainPairView, TokenRefreshView
from . import views

urlpatterns = [
    path('', views.home, name='home'),

    path('qrcode', views.generate_qr_code_view, name='generate_qr_code'),
    path('courses', views.course_pdf, name='courses'),
    path('courses_qrcode', views.courses_qrcode, name='courses_qrcode'),
    path('api/teacher-names/', views.TeacherNamesAPIView.as_view(), name='teacher_names_api'),

    path('api/custom-user/', views.CustomUserAPIView.as_view(), name='custom-user-api'),
    path('api/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api/logout/', TokenBlacklistView.as_view(), name='logout'),

    path('api/restrict/', views.RestrictedAPIView.as_view(), name='restricted'),
    path('api/userlogindata/', views.CustomUserLoginData.as_view(), name='userlogindata'),
    path('api/userdata/', views.CustomUserData.as_view(), name='userdata'),
    path('api/teacher-attendance/', views.TeacherAttendance.as_view(), name='teacher_attendance'),
    path('api/get_course_pdf/', views.CoursePDFView.as_view(), name='get_course_pdf'),
    path('api/sync-attendance/', views.SyncAttendance.as_view(), name='sync-attendance'),
]
