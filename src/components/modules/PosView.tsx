'use client';

import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  QrCode,
  CreditCard,
  UserPlus,
  Droplets,
  PackageCheck,
  CheckCircle2,
  Receipt,
  RotateCcw,
  ShoppingCart,
  Package,
  Check,
  Barcode,
  Tag,
  Percent,
  Coins,
  Gift,
} from 'lucide-react';
import {
  Product,
  Customer,
  Order,
  OrderItem,
  PaymentMethod,
  PaymentStatus,
  SystemSettings,
  UserAccount,
  ContainerUnitItem,
  DiscountType,
} from '@/types/water-factory';
import { generateUuid } from '@/lib/supabase-service';
import {
  usdToKhr,
  khrToUsd,
  formatUsd,
  formatKhr,
  formatCurrency,
  roundKhr,
} from '@/lib/financial-engine';
import { ThermalReceiptModal } from '../pos/ThermalReceiptModal';
import { ProductVisual } from '@/components/common/ProductVisual';

interface PosViewProps {
  products: Product[];
  customers: Customer[];
  settings: SystemSettings;
  activeUser: UserAccount;
  containerUnits?: ContainerUnitItem[];
  onCompleteOrder: (order: Order, updatedCustomer?: Customer) => void;
  onAddCustomer: (newCustomer: Customer) => void;
}

interface CartItem extends OrderItem {
  product: Product;
}

export const PosView: React.FC<PosViewProps> = ({
  products,
  customers,
  settings,
  activeUser,
  containerUnits = [],
  onCompleteOrder,
  onAddCustomer,
}) => {
  // State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || 'cust-retail'
  );
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_khr');
  const [paidInputUsd, setPaidInputUsd] = useState<string>('');
  const [paidInputKhr, setPaidInputKhr] = useState<string>('');
  const [discountMode, setDiscountMode] = useState<DiscountType>('none');
  const [discountInputValue, setDiscountInputValue] = useState<string>('');
  const [orderNotes, setOrderNotes] = useState('');
  const [posMobileTab, setPosMobileTab] = useState<'catalog' | 'cart'>('catalog');
  const [priceMode, setPriceMode] = useState<'retail' | 'wholesale'>('retail');

  // 20L Empty Bottle Exchange State
  const [containersDelivered20L, setContainersDelivered20L] = useState<number>(0);
  const [containersReturned20L, setContainersReturned20L] = useState<number>(0);

  // Quick Customer Create Modal State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');

  // Receipt Modal State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Selected customer object
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId) || customers[0];

  // Cart Calculations
  const subtotalUsd = cart.reduce((sum, item) => sum + item.totalUsd, 0);
  const subtotalKhr = usdToKhr(subtotalUsd, settings.exchangeRateKhrPerUsd);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Effective Discount Calculation (ជា %, ជារៀល ៛, ឥតគិតថ្លៃ Free)
  let effectiveDiscountUsd = 0;
  let effectiveDiscountKhr = 0;
  let discountDisplayValue = 0;

  if (subtotalUsd > 0) {
    if (discountMode === 'free') {
      effectiveDiscountUsd = subtotalUsd;
      effectiveDiscountKhr = subtotalKhr;
      discountDisplayValue = 100;
    } else if (discountMode === 'percent') {
      const pct = Math.min(100, Math.max(0, parseFloat(discountInputValue) || 0));
      discountDisplayValue = pct;
      effectiveDiscountUsd = Number(((subtotalUsd * pct) / 100).toFixed(2));
      effectiveDiscountKhr = Math.round((subtotalKhr * pct) / 100);
    } else if (discountMode === 'khr') {
      const khrVal = Math.max(0, parseFloat(discountInputValue) || 0);
      discountDisplayValue = khrVal;
      effectiveDiscountKhr = Math.min(subtotalKhr, khrVal);
      effectiveDiscountUsd = Number((effectiveDiscountKhr / settings.exchangeRateKhrPerUsd).toFixed(2));
    }
  }

  const grandTotalUsd = Math.max(0, Number((subtotalUsd - effectiveDiscountUsd).toFixed(2)));
  const grandTotalKhr = Math.max(0, subtotalKhr - effectiveDiscountKhr);

  const getUnitLabel = (u: string) => {
    const found = containerUnits.find((item) => item.code === u);
    if (found) return found.nameKh;
    switch (u) {
      case 'container_20l':
        return 'ធុង ២០L';
      case 'pack_350ml':
        return 'យួរ ៣៥០ml';
      case 'pack_500ml':
        return 'យួរ ៥០០ml';
      case 'pack_1500ml':
        return 'យួរ ១.៥L';
      default:
        return u;
    }
  };

  // Filter products by search
  const filteredProducts = products.filter(
    (p) =>
      p.isActive &&
      (p.nameKh.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.productCode.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Add Product to Cart with selected price mode (Retail vs Wholesale)
  const handleAddToCart = (product: Product) => {
    const itemPriceKhr =
      priceMode === 'wholesale' && (product.wholesalePriceKhr || 0) > 0
        ? product.wholesalePriceKhr
        : product.retailPriceKhr || product.salePriceKhr;
    const itemPriceUsd = khrToUsd(itemPriceKhr, settings.exchangeRateKhrPerUsd);

    const existingIndex = cart.findIndex((item) => item.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].totalUsd = Number(
        (updated[existingIndex].quantity * updated[existingIndex].unitPriceUsd).toFixed(2)
      );
      updated[existingIndex].totalKhr = usdToKhr(
        updated[existingIndex].totalUsd,
        settings.exchangeRateKhrPerUsd
      );
      setCart(updated);
    } else {
      const newItem: CartItem = {
        id: generateUuid(),
        productId: product.id,
        productNameKh: product.nameKh,
        unit: product.unit,
        quantity: 1,
        unitCostUsd: product.unitCostUsd || 0,
        unitPriceUsd: itemPriceUsd,
        unitPriceKhr: itemPriceKhr,
        totalUsd: itemPriceUsd,
        totalKhr: itemPriceKhr,
        product,
      };
      setCart([...cart, newItem]);
    }

    // Auto-update 20L delivered count if 20L product
    if (product.isRefill20l) {
      setContainersDelivered20L((prev) => prev + 1);
    }
  };

  // Update Cart Quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    const item = cart.find((i) => i.productId === productId);
    if (!item) return;

    if (item.quantity + delta <= 0) {
      handleRemoveItem(productId);
    } else {
      const updated = cart.map((i) => {
        if (i.productId === productId) {
          const newQty = i.quantity + delta;
          const totalUsd = Number((newQty * i.unitPriceUsd).toFixed(2));
          return {
            ...i,
            quantity: newQty,
            totalUsd,
            totalKhr: usdToKhr(totalUsd, settings.exchangeRateKhrPerUsd),
          };
        }
        return i;
      });
      setCart(updated);

      if (item.product.isRefill20l) {
        setContainersDelivered20L((prev) => Math.max(0, prev + delta));
      }
    }
  };

  // Remove Cart Item
  const handleRemoveItem = (productId: string) => {
    const item = cart.find((i) => i.productId === productId);
    if (item && item.product.isRefill20l) {
      setContainersDelivered20L((prev) => Math.max(0, prev - item.quantity));
    }
    setCart(cart.filter((i) => i.productId !== productId));
  };

  // Clear Cart
  const handleClearCart = () => {
    setCart([]);
    setDiscountMode('none');
    setDiscountInputValue('');
    setPaidInputUsd('');
    setPaidInputKhr('');
    setContainersDelivered20L(0);
    setContainersReturned20L(0);
  };

  // Handle Quick Create Customer
  const handleSaveQuickCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) return;

    const newCustomer: Customer = {
      id: generateUuid(),
      customerCode: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
      fullName: newCustName.trim(),
      phoneNumber: newCustPhone.trim() || 'N/A',
      deliveryAddress: newCustAddress.trim() || 'ភ្នំពេញ',
      totalDebtUsd: 0,
      totalDebtKhr: 0,
      emptyContainersHeld: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    onAddCustomer(newCustomer);
    setSelectedCustomerId(newCustomer.id);
    setIsCustomerModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustAddress('');
  };

  // Checkout Execution
  const handleCheckout = () => {
    if (cart.length === 0) return;

    let paidUsd = 0;
    let paidKhr = 0;

    if (grandTotalUsd === 0) {
      paidUsd = 0;
      paidKhr = 0;
    } else if (paymentMethod === 'credit') {
      paidUsd = 0;
      paidKhr = 0;
    } else if (paymentMethod === 'cash_usd') {
      paidUsd = parseFloat(paidInputUsd) || grandTotalUsd;
    } else if (paymentMethod === 'cash_khr') {
      paidKhr = parseFloat(paidInputKhr) || grandTotalKhr;
    } else if (paymentMethod === 'khqr') {
      paidUsd = grandTotalUsd;
    }

    const totalPaidInUsdEquivalent = paidUsd + (paidKhr > 0 ? paidKhr / settings.exchangeRateKhrPerUsd : 0);
    const remainingDebtUsd = grandTotalUsd === 0 ? 0 : Math.max(0, Number((grandTotalUsd - totalPaidInUsdEquivalent).toFixed(2)));

    let paymentStatus: PaymentStatus = 'paid';
    if (remainingDebtUsd > 0) {
      paymentStatus = totalPaidInUsdEquivalent > 0 ? 'partial' : 'unpaid';
    }

    // Customer empty balance difference & history snapshot
    const previousHeld = selectedCustomer.emptyContainersHeld || 0;
    const netBottleChange = containersDelivered20L - containersReturned20L;
    const totalHeld = Math.max(0, previousHeld + netBottleChange);

    const newOrder: Order = {
      id: generateUuid(),
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.fullName,
      customerPhone: selectedCustomer.phoneNumber,
      cashierName: activeUser.fullName,
      orderDate: new Date().toISOString(),
      status: 'completed',
      paymentStatus,
      paymentMethod,
      exchangeRate: settings.exchangeRateKhrPerUsd,
      subtotalUsd,
      discountUsd: effectiveDiscountUsd,
      discountKhr: effectiveDiscountKhr,
      discountType: discountMode !== 'none' ? discountMode : undefined,
      discountValue: discountDisplayValue,
      grandTotalUsd,
      grandTotalKhr,
      paidAmountUsd: paidUsd,
      paidAmountKhr: paidKhr,
      remainingDebtUsd,
      containersDelivered20L,
      containersReturned20L,
      previousEmptyContainersHeld: previousHeld,
      totalEmptyContainersHeld: totalHeld,
      items: cart.map(({ product, ...item }) => item),
      notes: discountMode === 'free'
        ? (orderNotes.trim() ? `${orderNotes.trim()} [ឥតគិតថ្លៃ]` : 'ឥតគិតថ្លៃ (Free of Charge)')
        : (orderNotes.trim() || undefined),
    };

    const updatedCustomer: Customer = {
      ...selectedCustomer,
      totalDebtUsd: Number((selectedCustomer.totalDebtUsd + remainingDebtUsd).toFixed(2)),
      totalDebtKhr: usdToKhr(
        selectedCustomer.totalDebtUsd + remainingDebtUsd,
        settings.exchangeRateKhrPerUsd
      ),
      emptyContainersHeld: totalHeld,
    };

    onCompleteOrder(newOrder, updatedCustomer);
    setCompletedOrder(newOrder);
    setIsReceiptModalOpen(true);
    handleClearCart();
    setPosMobileTab('catalog');
  };

  return (
    <div className="relative">
      {/* Mobile Top Segmented Tab Switcher (< lg devices) */}
      <div className="lg:hidden flex items-center bg-slate-900/95 p-1 rounded-2xl border border-slate-800 mb-3 shadow-lg">
        <button
          type="button"
          onClick={() => setPosMobileTab('catalog')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${posMobileTab === 'catalog'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-white'
            }`}
        >
          <Package className="w-4 h-4" />
          <span>មុខទំនិញ (Catalog)</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-800 rounded-full font-normal">
            {filteredProducts.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setPosMobileTab('cart')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all relative ${posMobileTab === 'cart'
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30'
              : 'text-slate-400 hover:text-white'
            }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>កន្ត្រក & គិតប្រាក់ (Cart)</span>
          {totalCartItems > 0 && (
            <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-cyan-400 text-slate-950">
              {totalCartItems}
            </span>
          )}
        </button>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 lg:h-[calc(100vh-6rem)]">
        {/* LEFT: Products Catalog Grid (7 Cols on desktop, full on mobile when catalog active) */}
        <div
          className={`lg:col-span-7 flex flex-col h-[calc(100vh-14rem)] lg:h-full bg-slate-900/80 rounded-3xl border border-slate-800 p-3 sm:p-4 overflow-hidden ${posMobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'
            }`}
        >
          {/* Search & Filter Header with Retail / Wholesale Mode Toggle */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ស្វែងរកទឹកធុង ២០L ឬ ទឹកដប (Search products)..."
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Price Tier Toggle: Retail vs Wholesale */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-2xl border border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setPriceMode('retail')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  priceMode === 'retail'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="លក់រាយ (Retail Price)"
              >
                <span>🛒 រាយ</span>
              </button>
              <button
                type="button"
                onClick={() => setPriceMode('wholesale')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  priceMode === 'wholesale'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="លក់ដុំ (Wholesale Price)"
              >
                <span>📦 ដុំ</span>
              </button>
            </div>

            <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-1.5 bg-slate-800 rounded-xl shrink-0">
              {filteredProducts.length} មុខ
            </span>
          </div>

          {/* Product Cards Grid - MyPOS Inspired Responsive Adaptive Grid */}
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 min-[1920px]:grid-cols-5 min-[2400px]:grid-cols-6 gap-2.5 sm:gap-3 items-stretch content-start">
            {filteredProducts.map((product) => {
              const is20L = product.isRefill20l;
              const retailPrice = product.retailPriceKhr || product.salePriceKhr || 0;
              const wholesalePrice = product.wholesalePriceKhr || 0;
              const activePrice =
                priceMode === 'wholesale' && wholesalePrice > 0 ? wholesalePrice : retailPrice;

              const cartItem = cart.find((i) => i.productId === product.id);
              const cartQuantity = cartItem ? cartItem.quantity : 0;
              const isInCart = cartQuantity > 0;

              return (
                <article
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  className={`group relative flex flex-col justify-between h-full p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border text-left transition-all duration-200 select-none cursor-pointer active:scale-[0.98] overflow-hidden ${
                    isInCart
                      ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                      : 'bg-slate-900/90 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/50 shadow-sm hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col">
                    {/* 1. Strict Aspect-Ratio Visual Banner */}
                    <div className="relative w-full aspect-[16/10] rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0 flex items-center justify-center group-hover:border-slate-700 transition">
                      <ProductVisual
                        unit={product.unit}
                        isRefill20l={product.isRefill20l}
                        productCode={product.productCode}
                        showRipples={false}
                      />

                      {/* Top-Left Code Badge */}
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-slate-950/85 backdrop-blur-md text-cyan-400 border border-slate-800 shadow-sm">
                        {product.productCode}
                      </span>

                      {/* Top-Right Unit Badge */}
                      <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md text-[9px] font-bold bg-cyan-950/85 backdrop-blur-md text-cyan-300 border border-cyan-800/50 shadow-sm">
                        {getUnitLabel(product.unit)}
                      </span>

                      {/* Floating In-Cart Badge */}
                      {isInCart && (
                        <div className="absolute bottom-2 left-2 z-10 animate-in zoom-in-75 duration-150">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-500 px-2 py-0.5 text-[9px] font-black text-slate-950 shadow-md">
                            <Check className="w-2.5 h-2.5" /> {cartQuantity}
                          </span>
                        </div>
                      )}

                      {/* Bottom-Right Refill indicator if 20L */}
                      {is20L && !isInCart && (
                        <span className="absolute bottom-2 left-2 z-10 px-1.5 py-0.5 rounded-md text-[8px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          ប្តូរសំបក ២០L
                        </span>
                      )}
                    </div>

                    {/* 2. Standardized Fixed-Height Title Block (Strictly 40px) */}
                    <div className="mt-2 h-10 flex flex-col justify-start overflow-hidden">
                      <h4
                        title={product.nameKh}
                        className="text-xs sm:text-[13px] font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 leading-snug"
                      >
                        {product.nameKh}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate font-medium">
                        {product.nameEn || 'SRP Pure Water'}
                      </p>
                    </div>
                  </div>

                  {/* 3. Footer: Active Price & MyPOS Action Button (Strictly Fixed Height 40px) */}
                  <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 h-10">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span
                          className={`text-xs sm:text-sm lg:text-base font-black font-mono leading-none truncate ${
                            priceMode === 'wholesale' ? 'text-emerald-400' : 'text-cyan-300'
                          }`}
                        >
                          {formatCurrency(activePrice, 'KHR')}
                        </span>
                        <span className="text-[8px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0">
                          {priceMode === 'wholesale' ? 'ដុំ' : 'រាយ'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">
                        ≈ {formatCurrency(khrToUsd(activePrice, settings.exchangeRateKhrPerUsd), 'USD')}
                      </p>
                    </div>

                    {/* MyPOS Quick Tap Target Button */}
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black transition shrink-0 shadow-sm ${
                        isInCart
                          ? 'bg-cyan-500 text-slate-950 shadow-cyan-500/20'
                          : 'bg-cyan-950/60 text-cyan-400 border border-cyan-800/50 group-hover:bg-cyan-500 group-hover:text-slate-950'
                      }`}
                    >
                      {isInCart ? `+${cartQuantity}` : '+'}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* RIGHT: POS Order Cart & Checkout (5 Cols on desktop, full on mobile when cart active) */}
        <div
          className={`lg:col-span-5 flex flex-col h-[calc(100vh-14rem)] lg:h-full bg-slate-900/90 rounded-3xl border border-slate-800 p-3 sm:p-4 overflow-y-auto overflow-x-hidden ${
            posMobileTab === 'cart' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Mobile Back Button to Catalog */}
          <div className="lg:hidden pb-2.5 mb-2 border-b border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setPosMobileTab('catalog')}
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 py-1 active:scale-95 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>← បន្ថែមទំនិញទៀត (Catalog)</span>
            </button>
            <span className="text-[11px] text-slate-400 font-medium">
              {totalCartItems} មុខក្នុងកន្ត្រក
            </span>
          </div>

          {/* Customer Selector Header */}
          <div className="pb-3 border-b border-slate-800 flex items-center justify-between gap-2">
            <div className="flex-1 min-w-0">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                ជ្រើសរើសអតិថិជន (Customer)
              </label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 truncate"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.emptyContainersHeld > 0 ? `${c.emptyContainersHeld} ធុងជំពាក់` : 'គ្មានជំពាក់ធុង'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsCustomerModalOpen(true)}
              className="mt-4 p-2 rounded-xl bg-cyan-600/20 text-cyan-400 hover:bg-cyan-600 hover:text-white border border-cyan-500/30 transition text-xs flex items-center gap-1 shrink-0"
              title="បន្ថែមអតិថិជនថ្មី"
            >
              <UserPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Customer Status Bar */}
          {selectedCustomer && (
            <div className="py-2 px-3 my-2 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-[11px]">
              <div>
                <span className="text-slate-400">ជំពាក់លុយចាស់៖ </span>
                <span className={selectedCustomer.totalDebtUsd > 0 ? 'font-bold text-rose-400' : 'text-slate-300'}>
                  {formatUsd(selectedCustomer.totalDebtUsd)}
                </span>
              </div>
              <div>
                <span className="text-slate-400">សំបកធុងកាន់កាប់៖ </span>
                <span className="font-bold text-cyan-300 px-1.5 py-0.2 bg-cyan-950 rounded border border-cyan-800/40">
                  {selectedCustomer.emptyContainersHeld} ធុង
                </span>
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="py-2 space-y-2 pr-1 max-h-56 sm:max-h-64 overflow-y-auto shrink-0">
            {cart.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-slate-500 text-xs">
                <Droplets className="w-8 h-8 text-slate-700 mb-1.5" />
                <p>មិនទាន់មានទំនិញក្នុងកន្ត្រកទេ។</p>
                <p className="text-[10px] text-slate-600">សូមចុចលើផលិតផលនៅខាងឆ្វេង</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs"
                >
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-white leading-tight">{item.productNameKh}</p>
                    <p className="text-[10px] text-slate-400">
                      ${item.unitPriceUsd.toFixed(2)} × {item.quantity} ={' '}
                      <span className="text-cyan-400 font-semibold">${item.totalUsd.toFixed(2)}</span>
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, -1)}
                      className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold text-white text-xs">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.productId, 1)}
                      className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.productId)}
                    className="ml-2 p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* 20L Empty Container Exchange Module */}
          <div className="p-3 my-2 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-cyan-300">
              <span className="flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-cyan-400" />
                ចរន្តសំបកធុង ២០L (Empty Bottle Exchange)
              </span>
              <span className="text-[10px] text-cyan-400 font-normal">
                ជំពាក់សរុប: {Math.max(0, (selectedCustomer.emptyContainersHeld || 0) + (containersDelivered20L - containersReturned20L))} ធុង
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <label className="block text-[10px] text-slate-400 mb-1">
                  ធុងទឹកដឹកទៅ (+Delivered)
                </label>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setContainersDelivered20L(Math.max(0, containersDelivered20L - 1))}
                    className="px-2 py-0.5 bg-slate-800 rounded font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-cyan-300">{containersDelivered20L}</span>
                  <button
                    type="button"
                    onClick={() => setContainersDelivered20L(containersDelivered20L + 1)}
                    className="px-2 py-0.5 bg-slate-800 rounded font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <label className="block text-[10px] text-slate-400 mb-1">
                  សំបកយកមកវិញ (-Returned)
                </label>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setContainersReturned20L(Math.max(0, containersReturned20L - 1))}
                    className="px-2 py-0.5 bg-slate-800 rounded font-bold"
                  >
                    -
                  </button>
                  <span className="font-bold text-emerald-400">{containersReturned20L}</span>
                  <button
                    type="button"
                    onClick={() => setContainersReturned20L(containersReturned20L + 1)}
                    className="px-2 py-0.5 bg-slate-800 rounded font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Live calculation breakdown */}
            <div className="pt-1.5 border-t border-cyan-800/30 flex items-center justify-between text-[10px] text-slate-300">
              <span>ជំពាក់ចាស់: <b className="text-white">{selectedCustomer.emptyContainersHeld || 0}</b></span>
              <span>+ ដឹកជញ្ជូន: <b className="text-cyan-300">+{containersDelivered20L}</b></span>
              <span>- យកត្រឡប់: <b className="text-emerald-400">-{containersReturned20L}</b></span>
              <span className="font-bold text-amber-300">
                = សរុប: {Math.max(0, (selectedCustomer.emptyContainersHeld || 0) + (containersDelivered20L - containersReturned20L))} ធុង
              </span>
            </div>
          </div>

          {/* Discount Section (ជា %, ជារៀល, ឥតគិតថ្លៃ) */}
          <div className="p-3 my-2 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-200">
                <Tag className="w-3.5 h-3.5 text-cyan-400" />
                <span>បញ្ចុះតម្លៃ (Discount)</span>
                {discountMode !== 'none' && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {discountMode === 'percent' && `${discountInputValue || 0}%`}
                    {discountMode === 'khr' && `${formatCurrency(parseFloat(discountInputValue) || 0, 'KHR')}`}
                    {discountMode === 'free' && 'ឥតគិតថ្លៃ 100%'}
                  </span>
                )}
              </div>

              {discountMode !== 'none' && (
                <button
                  type="button"
                  onClick={() => {
                    setDiscountMode('none');
                    setDiscountInputValue('');
                  }}
                  className="text-[10px] text-rose-400 hover:text-rose-300 flex items-center gap-0.5 hover:underline"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>លុបចោល</span>
                </button>
              )}
            </div>

            {/* 3 Segmented Mode Tabs: % | ៛ (រៀល) | 🎁 ឥតគិតថ្លៃ */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => {
                  setDiscountMode('percent');
                  if (!discountInputValue || discountMode === 'khr') setDiscountInputValue('10');
                }}
                className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                  discountMode === 'percent'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Percent className="w-3 h-3" />
                <span>ជាភាគរយ (%)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDiscountMode('khr');
                  if (!discountInputValue || discountMode === 'percent') setDiscountInputValue('1000');
                }}
                className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                  discountMode === 'khr'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-3 h-3" />
                <span>ជារៀល (៛)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDiscountMode('free');
                  setDiscountInputValue('100');
                }}
                className={`py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                  discountMode === 'free'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Gift className="w-3 h-3" />
                <span>ឥតគិតថ្លៃ</span>
              </button>
            </div>

            {/* Mode 1: PERCENT */}
            {discountMode === 'percent' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountInputValue}
                      onChange={(e) => setDiscountInputValue(e.target.value)}
                      placeholder="បញ្ចូលភាគរយ..."
                      className="w-full pl-3 pr-7 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:border-cyan-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-bold">%</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">បញ្ចុះបាន:</span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      -{formatUsd(effectiveDiscountUsd)} ({formatKhr(effectiveDiscountKhr)})
                    </span>
                  </div>
                </div>

                {/* Quick % preset buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[5, 10, 15, 20, 50].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountInputValue(String(pct))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                        discountInputValue === String(pct)
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 2: KHR (ជារៀល) */}
            {discountMode === 'khr' && (
              <div className="space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={discountInputValue}
                      onChange={(e) => setDiscountInputValue(e.target.value)}
                      placeholder="បញ្ចូលចំនួនប្រាក់រៀល..."
                      className="w-full pl-3 pr-7 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:border-emerald-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1.5 text-xs text-slate-400 font-bold">៛</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block">បញ្ចុះបាន:</span>
                    <span className="text-xs font-mono font-bold text-rose-400">
                      -{formatKhr(effectiveDiscountKhr)} (≈ {formatUsd(effectiveDiscountUsd)})
                    </span>
                  </div>
                </div>

                {/* Quick KHR preset buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {[500, 1000, 2000, 5000, 10000].map((khrVal) => (
                    <button
                      key={khrVal}
                      type="button"
                      onClick={() => setDiscountInputValue(String(khrVal))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                        discountInputValue === String(khrVal)
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {khrVal.toLocaleString()} ៛
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mode 3: FREE (ឥតគិតថ្លៃ) */}
            {discountMode === 'free' && (
              <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-700/50 flex items-center justify-between text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🎉</span>
                  <div>
                    <p className="font-bold text-purple-200">ឥតគិតថ្លៃ ១០០% (Free of Charge)</p>
                    <p className="text-[10px] text-purple-300/80">
                      អតិថិជនមិនបាច់បង់ប្រាក់ ({formatKhr(subtotalKhr)} / {formatUsd(subtotalUsd)})
                    </p>
                  </div>
                </div>
                <span className="text-xs font-black font-mono text-emerald-400">0 ៛</span>
              </div>
            )}
          </div>

          {/* Payment & Totals Section */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            {/* Payment Method Selector or Free banner */}
            {grandTotalUsd === 0 ? (
              <div className="p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/40 text-center text-xs font-bold text-purple-200 flex items-center justify-center gap-1.5 shadow-xs">
                <span>🎁</span>
                <span>ការបញ្ជាទិញឥតគិតថ្លៃ (Free of Charge) — មិនទាមទារការបង់ប្រាក់</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_khr')}
                  className={`py-2 px-2 rounded-xl border transition text-center ${paymentMethod === 'cash_khr'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                >
                  លុយរៀល (KHR)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash_usd')}
                  className={`py-2 px-2 rounded-xl border transition text-center ${paymentMethod === 'cash_usd'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                >
                  លុយដុល្លារ ($)
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('khqr')}
                  className={`py-2 px-2 rounded-xl border transition text-center ${paymentMethod === 'khqr'
                      ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                >
                  KHQR Scan
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`py-2 px-2 rounded-xl border transition text-center ${paymentMethod === 'credit'
                      ? 'bg-rose-600 text-white border-rose-500 shadow-sm font-bold'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                >
                  ជំពាក់ (Credit)
                </button>
              </div>
            )}

            {/* Subtotal & Discount row if discount applied */}
            {effectiveDiscountUsd > 0 && (
              <div className="px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <span>សរុបបឋម:</span>
                  <span className="font-mono text-slate-300 font-bold">{formatUsd(subtotalUsd)}</span>
                  <span className="text-[10px] text-slate-500">({formatKhr(subtotalKhr)})</span>
                </div>
                <div className="flex items-center gap-1 text-rose-400 font-bold font-mono">
                  <span>បញ្ចុះ:</span>
                  <span>-{formatUsd(effectiveDiscountUsd)}</span>
                  <span className="text-[10px] text-rose-300/80 font-normal">(-{formatKhr(effectiveDiscountKhr)})</span>
                </div>
              </div>
            )}

            {/* Grand Total Display */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 block truncate">សរុបត្រូវបង់ (Grand Total):</span>
                <p className="text-lg sm:text-xl font-extrabold text-white truncate">{formatUsd(grandTotalUsd)}</p>
              </div>
              <div className="text-right min-w-0">
                <span className="text-[10px] text-slate-400 block truncate">ជាប្រាក់រៀល:</span>
                <p className="text-base sm:text-lg font-bold text-emerald-400 truncate">{formatKhr(grandTotalKhr)}</p>
              </div>
            </div>

            {/* Actions: Clear & Checkout (Sticky at bottom so never lost when scrolling) */}
            <div className="sticky bottom-0 pt-2 pb-1 bg-slate-900/95 backdrop-blur-md flex gap-2 border-t border-slate-800/80 mt-2 z-10">
              <button
                onClick={handleClearCart}
                disabled={cart.length === 0}
                className="px-3.5 py-2.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-xl transition shrink-0"
                title="លុបកន្ត្រក"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 shadow-lg shadow-cyan-600/30 transition transform active:scale-98"
              >
                <Receipt className="w-4 h-4" />
                <span>ទូទាត់ & ចេញវិក្កយបត្រ (Checkout)</span>
              </button>
            </div>
          </div>
        </div>
        {/* End Main Grid Workspace */}
      </div>

      {/* Floating Sticky Cart Bar on Mobile (< lg) when catalog active & has items */}
      {posMobileTab === 'catalog' && totalCartItems > 0 && (
        <div className="lg:hidden fixed bottom-20 left-3 right-3 z-20 flex items-center justify-between p-3 rounded-2xl bg-slate-900/95 border border-cyan-500/50 shadow-2xl backdrop-blur-xl animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-md shadow-cyan-500/30">
              {totalCartItems}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 leading-none">សរុបក្នុងកន្ត្រក ({totalCartItems} មុខ)</p>
              <p className="text-xs font-black text-cyan-300 truncate">
                {formatUsd(grandTotalUsd)}{' '}
                <span className="text-[10px] text-emerald-400 font-bold">
                  ({formatKhr(grandTotalKhr)})
                </span>
                {discountMode === 'free' && (
                  <span className="ml-1 text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 font-bold">
                    ឥតគិតថ្លៃ
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPosMobileTab('cart')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md shadow-cyan-600/30 shrink-0 active:scale-95 transition"
          >
            <span>គិតលុយ</span>
            <Receipt className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Quick Add Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSaveQuickCustomer}
            className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-cyan-400" />
              បង្កើតអតិថិជនថ្មីរហ័ស (Quick Add Customer)
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">ឈ្មោះអតិថិជន *</label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="ឧ. ម៉ាត ហេងហេង ឬ ភោជនីយដ្ឋាន..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">លេខទូរស័ព្ទ</label>
              <input
                type="text"
                value={newCustPhone}
                onChange={(e) => setNewCustPhone(e.target.value)}
                placeholder="ឧ. 012 345 678"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">អាសយដ្ឋានដឹកជញ្ជូន</label>
              <input
                type="text"
                value={newCustAddress}
                onChange={(e) => setNewCustAddress(e.target.value)}
                placeholder="ឧ. សង្កាត់ចោមចៅ ភ្នំពេញ"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                បោះបង់
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow"
              >
                រក្សាទុក
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Instant Thermal Receipt Modal */}
      <ThermalReceiptModal
        order={completedOrder}
        settings={settings}
        previousEmptyBalance={completedOrder?.previousEmptyContainersHeld}
        customerEmptyBalance={completedOrder?.totalEmptyContainersHeld}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};
