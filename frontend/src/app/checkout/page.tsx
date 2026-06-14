"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CreditCard, PackageCheck, ShieldCheck, TicketPercent } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { CheckoutSummary } from "@/components/order/CheckoutSummary";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { requireText } from "@/lib/validation";
import { useToast } from "@/providers/ToastProvider";
import { getApiErrorMessage } from "@/services/api";
import { couponService } from "@/services/coupon.service";
import { orderService } from "@/services/order.service";
import type { ApplyCouponResponse } from "@/types/coupon";

export default function CheckoutPage() {
  return (
    <ProtectedRoute>
      <CheckoutContent />
    </ProtectedRoute>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { cart, fetchCart, isLoading, resetCart } = useCart();
  const { showToast } = useToast();
  const [shippingAddress, setShippingAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<ApplyCouponResponse | null>(null);
  const [error, setError] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    shippingAddress: "",
    phone: "",
  });

  useEffect(() => {
    void fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    setShippingAddress(user?.address ?? "");
    setPhone(user?.phone ?? "");
  }, [user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({ shippingAddress: "", phone: "" });
    const validationError =
      requireText(shippingAddress, "Adresse de livraison") ||
      requireText(phone, "Telephone");

    if (validationError) {
      setFieldErrors({
        shippingAddress: requireText(shippingAddress, "Adresse de livraison"),
        phone: requireText(phone, "Telephone"),
      });
      setError(validationError);
      showToast("error", validationError);
      return;
    }

    if (shippingAddress.trim().length < 8) {
      const message = "Adresse de livraison trop courte.";
      setFieldErrors((current) => ({ ...current, shippingAddress: message }));
      setError(message);
      showToast("error", message);
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 8) {
      const message = "Telephone invalide. Ajoutez un numero joignable.";
      setFieldErrors((current) => ({ ...current, phone: message }));
      setError(message);
      showToast("error", message);
      return;
    }

    setIsSubmitting(true);

    try {
      await orderService.createOrder({
        shippingAddress: shippingAddress.trim(),
        phone: phone.trim(),
        couponCode: appliedCoupon?.coupon.code,
      });
      resetCart();
      showToast("success", "Commande creee avec succes.");
      router.push("/my-orders");
    } catch (submitError) {
      const message = getApiErrorMessage(submitError);
      setError(message);
      showToast("error", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleApplyCoupon() {
    setCouponError("");
    setIsApplyingCoupon(true);

    try {
      const result = await couponService.applyCoupon(couponCode);
      setAppliedCoupon(result);
      showToast("success", "Coupon applique.");
    } catch (applyError) {
      setAppliedCoupon(null);
      const message = getApiErrorMessage(applyError);
      setCouponError(message);
      showToast("error", message);
    } finally {
      setIsApplyingCoupon(false);
    }
  }

  if (isLoading && !cart) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <Loader label="Preparation du checkout" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="section-surface px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            action={
              <Link href="/shop">
                <Button size="lg">Retour boutique</Button>
              </Link>
            }
            description="Ajoutez au moins une piece avant de confirmer une commande."
            title="Panier vide"
          />
        </div>
      </main>
    );
  }

  return (
    <main className="section-surface px-4 py-8 sm:px-8 sm:py-10 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <section className="mb-8 rounded-md border border-luxury-beige bg-luxury-dark p-5 text-luxury-ivory shadow-luxury sm:p-8">
          <p className="premium-eyebrow">Checkout</p>
          <h1 className="mt-3 font-heading text-4xl font-semibold leading-tight sm:text-6xl">
            Confirmer la commande
          </h1>
          <p className="mt-4 max-w-2xl leading-8 text-luxury-beige">
            Verifiez vos produits, confirmez vos coordonnees et validez votre
            commande avec paiement a la livraison.
          </p>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-8">
          <Card className="overflow-hidden">
            <CardContent className="p-5 sm:p-8">
              <form className="grid gap-7" onSubmit={handleSubmit}>
                <section>
                  <SectionHeading
                    eyebrow="Etape 1"
                    title="Informations client"
                  />
                  <div className="mt-5 rounded-md border border-luxury-beige bg-luxury-ivory p-5">
                    <p className="font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="mt-1 text-sm text-luxury-text">{user?.email}</p>
                  </div>
                </section>

                <section className="grid gap-5">
                  <SectionHeading eyebrow="Etape 2" title="Adresse et telephone" />
                  <Input
                    error={fieldErrors.shippingAddress}
                    helperText="Exemple : quartier, rue, immeuble, ville."
                    label="Adresse de livraison"
                    name="shippingAddress"
                    onChange={(event) => setShippingAddress(event.target.value)}
                    required
                    value={shippingAddress}
                  />
                  <Input
                    error={fieldErrors.phone}
                    helperText="Numero utilise pour confirmer la livraison."
                    label="Telephone"
                    name="phone"
                    onChange={(event) => setPhone(event.target.value)}
                    required
                    type="tel"
                    value={phone}
                  />
                </section>

                <section className="grid gap-4 sm:grid-cols-3">
                  <CheckoutInfoCard
                    icon={<PackageCheck className="h-5 w-5" />}
                    title="Preparation"
                    text="Votre commande est preparee apres validation."
                  />
                  <CheckoutInfoCard
                    icon={<CreditCard className="h-5 w-5" />}
                    title="Paiement"
                    text="Paiement a la livraison, sans carte pour l'instant."
                  />
                  <CheckoutInfoCard
                    icon={<ShieldCheck className="h-5 w-5" />}
                    title="Verification"
                    text="Nous confirmons les coordonnees avant expedition."
                  />
                </section>

                <section className="rounded-md border border-luxury-beige p-5">
                  <div className="flex items-center gap-2">
                    <TicketPercent className="h-5 w-5 text-luxury-gold" />
                    <p className="font-medium">Coupon</p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                    <Input
                      name="couponCode"
                      onChange={(event) => {
                        setCouponCode(event.target.value.toUpperCase());
                        setAppliedCoupon(null);
                      }}
                      placeholder="YAKOUT10"
                      value={couponCode}
                    />
                    <Button
                      className="w-full sm:w-auto"
                      disabled={!couponCode.trim() || isApplyingCoupon}
                      onClick={handleApplyCoupon}
                      type="button"
                      variant="black"
                    >
                      {isApplyingCoupon ? "Verification..." : "Appliquer"}
                    </Button>
                  </div>
                  {appliedCoupon ? (
                    <p className="mt-3 text-sm text-luxury-gold">
                      Coupon {appliedCoupon.coupon.code} applique.
                    </p>
                  ) : null}
                  {couponError ? (
                    <p className="mt-3 text-sm text-red-600">{couponError}</p>
                  ) : null}
                </section>

                {error ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}

                <Button
                  className="w-full"
                  disabled={isSubmitting}
                  size="lg"
                  type="submit"
                  variant="gold"
                >
                  {isSubmitting ? "Creation..." : "Confirmer commande"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <CheckoutSummary
            cart={cart}
            couponCode={appliedCoupon?.coupon.code}
            discountAmount={appliedCoupon?.discountAmount}
            finalTotal={appliedCoupon?.totalAmount}
          />
        </div>
      </div>
    </main>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <p className="premium-eyebrow">{eyebrow}</p>
      <h2 className="mt-2 font-heading text-3xl font-semibold">{title}</h2>
    </div>
  );
}

function CheckoutInfoCard({
  icon,
  text,
  title,
}: {
  icon: ReactNode;
  text: string;
  title: string;
}) {
  return (
    <div className="rounded-md border border-luxury-beige bg-luxury-ivory p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-luxury-black text-luxury-gold">
        {icon}
      </div>
      <p className="mt-3 font-medium">{title}</p>
      <p className="mt-1 text-sm leading-6 text-luxury-text">{text}</p>
    </div>
  );
}
