from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import CustomUser, Teacher, Student, Admin

@receiver(post_save, sender=CustomUser)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        if instance.profile_type == 'teacher':
            Teacher.objects.create(user=instance)
        elif instance.profile_type == 'student':
            Student.objects.create(user=instance)
        elif instance.profile_type == 'admin':
            Admin.objects.create(user=instance)
