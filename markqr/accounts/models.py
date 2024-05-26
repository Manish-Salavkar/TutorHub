# markqr\accounts\models.py
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager, Group, Permission
import uuid
import os

class CustomUserManager(BaseUserManager):
    def create_user(self, username, email, password, profile_type='student', **extra_fields):
        email = self.normalize_email(email)
        unique_key = str(uuid.uuid4())
        user = self.model(username=username, email=email, profile_type=profile_type, unique_key=unique_key, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, username, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(username, email, password, **extra_fields)
    

class CustomUser(AbstractUser):
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    unique_key = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    first_name = models.CharField(max_length=30, null=True, blank=True)
    last_name = models.CharField(max_length=30, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)

    PROFILE_CHOICES = [
        ('teacher', 'Teacher'),
        ('student', 'Student'),
        ('admin', 'Admin')
    ]

    profile_type = models.CharField(max_length=20, choices=PROFILE_CHOICES, default='student')
    
    objects = CustomUserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    groups = models.ManyToManyField(Group, verbose_name=('groups'), blank=True, related_name='custom_user_groups')
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=('user permissions'),
        blank=True,
        related_name='custom_user_permissions'
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
    
class Teacher(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    teacher_attendance_excel_sheet = models.URLField(blank=True, null=True)
    student_excel_sheet = models.URLField(blank=True, null=True)

class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    qrcode = models.URLField(blank=True, null=True)

class Admin(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, primary_key=True)
    can_read_only = models.BooleanField(default=False)
    can_read_write = models.BooleanField(default=False)

class TeachAttendance(models.Model):
    teacher = models.ForeignKey(Teacher, blank=True, on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    is_present = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)
    reason_for_absence = models.TextField(blank=True, null=True)

    class Meta:
        unique_together = ['teacher', 'date']

# UPDATE accounts_teachattendance
# SET date = date - interval '1 day'
# WHERE id = 21;

class CoursesPDF(models.Model):
    course_name = models.CharField(max_length=255)
    course_pdf = models.FileField(upload_to='course_pdfs/')

    def delete(self, *args, **kwargs):
        if self.course_pdf:
            file_path = self.course_pdf.path

            if os.path.exists(file_path):
                os.remove(file_path)

        super().delete(*args, **kwargs)
