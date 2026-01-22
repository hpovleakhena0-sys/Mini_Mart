from django.db import models
from django.utils import timezone

class Product(models.Model):
    name = models.CharField(max_length=100)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField(default=0)
    min_stock = models.IntegerField(default=0)
    category = models.CharField(max_length=50, blank=True)
    sku = models.CharField(max_length=50, unique=True, blank=True)
    supplier = models.CharField(max_length=100, blank=True)
    image = models.URLField(blank=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Customer(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15, blank=True)
    total_purchases = models.IntegerField(default=0)
    total_spent = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    last_visit = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, default='active')
    address = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Sale(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    sale_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.CharField(max_length=20, default='pending', choices=[
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ])
    payment_method = models.CharField(max_length=20, blank=True, choices=[
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('mobile', 'Mobile Payment'),
    ])

    def __str__(self):
        return f"Sale of {self.product.name} to {self.customer.name}"
     
    def process_payment(self, payment_method: str) -> bool:
        """
        Process payment and deduct stock from inventory.
        Returns True if successful, False otherwise.
        """
        try:
            # Check if product has sufficient stock
            if self.product.stock < self.quantity:
                return False

            # Deduct stock from product
            self.product.stock -= self.quantity
            self.product.save()

            # Update sale status
            self.payment_status = 'completed'
            self.payment_method = payment_method
            self.save()

            # Update customer statistics
            self.customer.total_purchases += 1
            self.customer.total_spent += self.total_price
            self.customer.save()

            # Create payment record
            Payment.objects.create(
                transaction_id=f"PAY-{self.id}-{int(timezone.now().timestamp())}",
                order_id=f"ORD-{self.id}",
                customer=self.customer,
                amount=self.total_price,
                method=payment_method,
                status='completed'
            )

            return True
        except Exception:
            # If any error occurs, mark as failed
            self.payment_status = 'failed'
            self.save()
            return False

class Staff(models.Model):
    STAFF_ROLES = [
        ('manager', 'Manager'),
        ('cashier', 'Cashier'),
        ('inventory', 'Inventory'),
        ('accountant', 'Accountant'),
    ]

    STAFF_STATUSES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    role = models.CharField(max_length=20, choices=STAFF_ROLES, default='cashier')
    department = models.CharField(max_length=50, blank=True)
    status = models.CharField(max_length=20, choices=STAFF_STATUSES, default='active')
    last_login = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Supplier(models.Model):
    SUPPLIER_STATUSES = [
        ('active', 'Active'),
        ('pending', 'Pending'),
        ('inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=100)
    contact_person = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=SUPPLIER_STATUSES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Payment(models.Model):
    PAYMENT_METHODS = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('mobile', 'Mobile Payment'),
    ]

    PAYMENT_STATUSES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]

    transaction_id = models.CharField(max_length=100, unique=True)
    order_id = models.CharField(max_length=100)
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUSES, default='completed')
    payment_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment {self.transaction_id} - {self.customer.name} - ${self.amount}"
