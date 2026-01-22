from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductViewSet, CustomerViewSet, SaleViewSet, PaymentViewSet, StaffViewSet, SupplierViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'customers', CustomerViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'staff', StaffViewSet)
router.register(r'suppliers', SupplierViewSet)

urlpatterns = [
    path('', include(router.urls)),
]