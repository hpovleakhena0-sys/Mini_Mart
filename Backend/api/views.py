from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum, F, Count
from django.utils import timezone
from datetime import timedelta
from .models import Product, Customer, Sale, Payment, Staff, Supplier
from .serializers import ProductSerializer, CustomerSerializer, SaleSerializer, PaymentSerializer, StaffSerializer, SupplierSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by('id')
    serializer_class = ProductSerializer
    search_fields = ['name', 'sku', 'category', 'supplier']

class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all().order_by('id')
    serializer_class = CustomerSerializer
    search_fields = ['name', 'email', 'phone']

class StaffViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.all().order_by('id')
    serializer_class = StaffSerializer
    search_fields = ['name', 'email', 'phone']

class SupplierViewSet(viewsets.ModelViewSet):
    queryset = Supplier.objects.all().order_by('id')
    serializer_class = SupplierSerializer
    search_fields = ['name', 'contact_person', 'email', 'phone']

class SaleViewSet(viewsets.ModelViewSet):
    queryset = Sale.objects.all()
    serializer_class = SaleSerializer

    @action(detail=False, methods=['get'])
    def dashboard(self, request):
        today = timezone.now().date()

        # Today's sales and transactions
        today_sales = Sale.objects.filter(sale_date__date=today, payment_status='completed')
        total_sales = today_sales.aggregate(total=Sum('total_price'))['total'] or 0
        transaction_count = today_sales.count()

        # Products in stock and low stock
        total_stock = Product.objects.aggregate(total=Sum('stock'))['total'] or 0
        low_stock_count = Product.objects.filter(stock__lt=F('min_stock')).count()

        # Active customers
        active_customers = Customer.objects.filter(status='active').count()

        # Recent sales
        recent_sales = Sale.objects.filter(payment_status='completed').order_by('-sale_date')[:5]

        # Low stock items
        low_stock_items = Product.objects.filter(stock__lt=F('min_stock')).values('name', 'stock', 'min_stock', 'category')[:5]

        # Today's performance
        total_payments = Payment.objects.filter(payment_date__date=today).count()
        successful_payments = Payment.objects.filter(payment_date__date=today, status='completed').count()
        payment_success_rate = (successful_payments / total_payments * 100) if total_payments > 0 else 0
        avg_transaction_value = total_sales / transaction_count if transaction_count > 0 else 0
        avg_checkout_time = 4.2  # Placeholder, as checkout time isn't tracked

        data = {
            'today_sales': total_sales,
            'transactions': transaction_count,
            'products_in_stock': total_stock,
            'low_stock_count': low_stock_count,
            'active_customers': active_customers,
            'recent_sales': SaleSerializer(recent_sales, many=True).data,
            'low_stock_items': list(low_stock_items),
            'payment_success_rate': payment_success_rate,
            'avg_transaction_value': avg_transaction_value,
            'avg_checkout_time': avg_checkout_time,
        }

        return Response(data)

    @action(detail=False, methods=['get'])
    def reports(self, request):
        """
        Generate comprehensive reports data
        """
        # Date ranges
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        month_ago = today - timedelta(days=30)

        # Revenue metrics
        total_revenue = Sale.objects.filter(payment_status='completed').aggregate(total=Sum('total_price'))['total'] or 0
        today_revenue = Sale.objects.filter(sale_date__date=today, payment_status='completed').aggregate(total=Sum('total_price'))['total'] or 0
        week_revenue = Sale.objects.filter(sale_date__date__gte=week_ago, payment_status='completed').aggregate(total=Sum('total_price'))['total'] or 0
        month_revenue = Sale.objects.filter(sale_date__date__gte=month_ago, payment_status='completed').aggregate(total=Sum('total_price'))['total'] or 0

        # Orders metrics
        total_orders = Sale.objects.filter(payment_status='completed').count()
        today_orders = Sale.objects.filter(sale_date__date=today, payment_status='completed').count()
        week_orders = Sale.objects.filter(sale_date__date__gte=week_ago, payment_status='completed').count()
        month_orders = Sale.objects.filter(sale_date__date__gte=month_ago, payment_status='completed').count()

        # Average order value
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

        # Customer metrics
        total_customers = Customer.objects.count()
        new_customers_today = Customer.objects.filter(created_at__date=today).count()
        new_customers_week = Customer.objects.filter(created_at__date__gte=week_ago).count()
        new_customers_month = Customer.objects.filter(created_at__date__gte=month_ago).count()

        # Top products
        top_products = Sale.objects.filter(payment_status='completed').values(
            'product__name', 'product__category'
        ).annotate(
            total_sold=Sum('quantity'),
            total_revenue=Sum('total_price')
        ).order_by('-total_sold')[:10]

        # Payment methods distribution
        payment_methods = Sale.objects.filter(payment_status='completed').values('payment_method').annotate(
            count=Count('id'),
            total=Sum('total_price')
        )

        # Recent reports (mock for now, could be stored in DB later)
        recent_reports = [
            {
                'name': f'Daily Sales Summary - {today}',
                'type': 'Sales',
                'size': '245 KB',
                'date': str(today),
            },
            {
                'name': f'Weekly Report - {week_ago} to {today}',
                'type': 'Sales',
                'size': '1.2 MB',
                'date': str(today),
            },
            {
                'name': f'Monthly Report - {month_ago} to {today}',
                'type': 'Sales',
                'size': '2.5 MB',
                'date': str(today),
            },
        ]

        data = {
            'metrics': {
                'revenue': {
                    'total': total_revenue,
                    'today': today_revenue,
                    'week': week_revenue,
                    'month': month_revenue,
                },
                'orders': {
                    'total': total_orders,
                    'today': today_orders,
                    'week': week_orders,
                    'month': month_orders,
                },
                'avg_order_value': avg_order_value,
                'customers': {
                    'total': total_customers,
                    'new_today': new_customers_today,
                    'new_week': new_customers_week,
                    'new_month': new_customers_month,
                },
            },
            'top_products': list(top_products),
            'payment_methods': list(payment_methods),
            'recent_reports': recent_reports,
        }

        return Response(data)

    def create(self, request, *args, **kwargs):
        """
        Override create to handle payment method context.
        """
        payment_method = request.data.get('payment_method', 'cash')
        serializer = self.get_serializer(data=request.data, context={'payment_method': payment_method})
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        sale = serializer.instance
        if payment_method:
            success = sale.process_payment(payment_method)
            if not success:
                return Response(
                    {'error': 'Payment processing failed. Insufficient stock or other error.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
     
    @action(detail=True, methods=['post'])
    def process_payment(self, request, pk=None):
        """
        Process payment for an existing sale.
        """
        try:
            sale = self.get_object()
            payment_method = request.data.get('payment_method', 'cash')
             
            if sale.payment_status != 'pending':
                return Response(
                    {'error': 'Payment already processed or cancelled'},
                    status=status.HTTP_400_BAD_REQUEST
                )
             
            success = sale.process_payment(payment_method)
             
            if success:
                serializer = self.get_serializer(sale)
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {'error': 'Payment processing failed. Insufficient stock or other error.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all().order_by('-payment_date')
    serializer_class = PaymentSerializer
