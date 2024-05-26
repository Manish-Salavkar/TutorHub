# serializers.py
from rest_framework import serializers
from .models import CustomUser, TeachAttendance, CoursesPDF
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone

class NameSerializer(serializers.Serializer):
    names = serializers.ListField(child=serializers.CharField())
    password = serializers.CharField(write_only=True)

class CustomUserCreationSerializer(serializers.ModelSerializer):
    def create(self, validated_data):
        password = validated_data.pop('password')
        instance = CustomUser.objects.create(**validated_data)
        instance.set_password(password)
        instance.save()
        return instance
    class Meta:
        model = CustomUser
        fields = ['username','email','password','first_name','last_name','phone_number','profile_type']

class TeacherAttendanceSerializer(serializers.ModelSerializer):
    date = serializers.ReadOnlyField()
    class Meta:
        model = TeachAttendance
        fields = ['teacher', 'date','is_present','is_approved', 'reason_for_absence']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        # Convert the datetime field to Asia/Kolkata timezone
        representation['date'] = instance.date.astimezone(timezone('Asia/Kolkata')).strftime('%Y-%m-%d %H:%M:%S')
        return representation
    
# class CoursePDFSerializer(serializers.ModelSerializer):
#     course_pdf = serializers.ReadOnlyField()
#     class Meta:
#         model = CoursesPDF
#         fields = ['course_name', 'course_pdf']