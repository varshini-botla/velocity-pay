
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { getUsdcEstimate, fetchCryptoInsight } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin, ClipboardCopy, Loader2, RefreshCw, Smartphone, Zap, CheckCircle, ArrowLeft, Check, Info } from 'lucide-react';
import { AvaxIcon } from '@/components/icons/avax-icon';
import { QRCodeCanvas } from 'qrcode.react';
import { ethers } from 'ethers';

const paymentSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Please enter a valid amount.' }).min(0.00001),
  merchantAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, { message: 'Invalid Avalanche C-Chain address.' }),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;
type Currency = 'AVAX' | 'BTC';

type PaymentData = {
  id: string;
  amount: number;
  currency: Currency;
  merchantAddress: string;
  link: string;
  estimatedUsdc: number | null;
  insight: string | null;
};

type PaymentStatus = 'idle' | 'waiting' | 'confirmed';

export default function CorePayLinksPage() {
  const [isClient, setIsClient] = useState(false);
  const [currency, setCurrency] = useState<Currency>('AVAX');
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [isCopying, setIsCopying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { toast } = useToast();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: undefined,
      merchantAddress: '0x742d35Cc6634C0532925a3b8D95f67b24C7f18e8',
    },
  });

  const { formState: { isSubmitting }, trigger, getValues, reset } = form;

  useEffect(() => {
    setIsClient(true);
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Install ethers for this conversion: npm install ethers
  const handleGenerateClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const isValid = await trigger();
    if (!isValid) return;

    const values = getValues();
    const paymentId = 'pay_' + Math.random().toString(36).substring(2, 11);
    
    // Core Wallet uses EIP-681 for payment URIs.
    // https://docs.core.app/developer-guides/deep-linking
    // For native assets, the format is:
    // ethereum:<target_address>@<chain_id>?value=<value_in_wei>
    
    const chainId = currency === 'AVAX' ? 43114 : 43114; // Using C-chain for both for this example. BTC on AVAX would use a different asset identifier.
    
    // Convert amount to WEI for the transaction
    const valueInWei = ethers.utils.parseUnits(values.amount.toString(), 18).toString();

    let paymentUri;
    // Note: True native BTC deeplinking is different. For simplicity, we'll treat BTC on AVAX (BTC.b) as the target.
    // A real implementation would require distinguishing between native BTC and BTC on Avalanche.
    if (currency === 'AVAX') {
       paymentUri = `ethereum:${values.merchantAddress}@${chainId}?value=${valueInWei}`;
    } else {
       // This would be the contract address for BTC.b on Avalanche
       const btcContractAddress = '0x152b9d0FdC40C096757F570A51E494bd4b943E50';
       // For ERC20 tokens, the format is slightly different
       paymentUri = `ethereum:${btcContractAddress}@${chainId}/transfer?address=${values.merchantAddress}&uint256=${valueInWei}`;
    }

    const newPaymentData: PaymentData = {
      id: paymentId,
      ...values,
      currency,
      link: paymentUri,
      estimatedUsdc: null,
      insight: null,
    };
    
    setPaymentData(newPaymentData);
    setPaymentStatus('waiting');

    getUsdcEstimate({ amount: values.amount, currency }).then(result => {
      if ('error' in result) {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
        setPaymentData(pd => pd ? { ...pd, estimatedUsdc: 0 } : null);
      } else {
        setPaymentData(pd => pd ? { ...pd, estimatedUsdc: result.estimatedUsdc } : null);
      }
    });

    fetchCryptoInsight({ currency }).then(result => {
      if ('error' in result) {
        // Don't show an error, just fail silently on the insight
        console.error(result.error);
        setPaymentData(pd => pd ? { ...pd, insight: "" } : null);
      } else {
        setPaymentData(pd => pd ? { ...pd, insight: result.insight } : null);
      }
    });
  };

  const handleCreateNew = () => {
    setPaymentData(null);
    setPaymentStatus('idle');
    reset();
  };

  const copyPaymentLink = () => {
    if (!paymentData) return;
    navigator.clipboard.writeText(paymentData.link).then(() => {
      setIsCopying(true);
      setTimeout(() => setIsCopying(false), 2000);
    });
  };
  
  const glassmorphicCardClass = "bg-card/30 backdrop-blur-lg border border-white/10 shadow-2xl shadow-black/40";

  const features = [
    { icon: Zap, title: "Instant Settlement", description: "Sub-second finality on Avalanche C-Chain with gas fees under $0.02" },
    { icon: Bitcoin, title: "Native Bitcoin", description: "Accept BTC payments directly through Core Wallet without wrapped tokens" },
    { icon: RefreshCw, title: "Auto-Convert", description: "Payments automatically swap to USDC using Trader Joe's DEX" },
    { icon: Smartphone, title: "One-Tap Checkout", "description": "Core Wallet deep-links eliminate extension pop-ups and friction" },
  ];

  if (!isClient) {
    return null;
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div 
        className="pointer-events-none absolute -inset-px transition-all duration-300" 
        style={{ background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsla(var(--primary)/0.1), transparent 40%)`}}
      />
      <div className="absolute inset-0 bg-grid-white/[0.07] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="absolute left-0 top-1/4 h-64 w-64 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute right-0 top-1/2 h-64 w-64 bg-accent/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto p-4 sm:p-6 md:p-8 relative z-10 flex flex-col items-center">
        <header className="text-center my-12 md:my-16 animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            VelocityPay
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-foreground/70">
            Generate instant, one-tap payment links on Avalanche.
          </p>
        </header>

        <main className="w-full max-w-lg transition-all duration-500">
          <Card className={cn("w-full transition-all duration-500 ease-in-out", glassmorphicCardClass)}>
            {!paymentData ? (
              <div className="animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Create a Payment Link</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                    <div>
                      <Label className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Currency</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <Button
                          type="button"
                          variant={currency === 'AVAX' ? 'secondary' : 'outline'}
                          className={cn("h-auto py-3 transition-all", currency === 'AVAX' && "ring-2 ring-primary")}
                          onClick={() => setCurrency('AVAX')}
                        >
                          <div className="flex items-center gap-2">
                            <AvaxIcon className="h-6 w-6" />
                            <span className="font-semibold">AVAX</span>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant={currency === 'BTC' ? 'secondary' : 'outline'}
                          className={cn("h-auto py-3 transition-all", currency === 'BTC' && "ring-2 ring-primary")}
                          onClick={() => setCurrency('BTC')}
                        >
                          <div className="flex items-center gap-2">
                            <Bitcoin className="h-6 w-6" />
                            <span className="font-semibold">BTC</span>
                          </div>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Amount</Label>
                      <Input id="amount" type="number" placeholder={`0.00 ${currency}`} step="any" {...form.register('amount')} />
                      {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="merchantAddress" className="text-xs font-semibold uppercase tracking-wider text-foreground/70">Your Address (AVAX C-Chain)</Label>
                      <Input id="merchantAddress" placeholder="0x..." {...form.register('merchantAddress')} />
                      {form.formState.errors.merchantAddress && <p className="text-sm text-destructive">{form.formState.errors.merchantAddress.message}</p>}
                    </div>
                  </form>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleGenerateClick} disabled={isSubmitting} className="w-full h-12 text-base font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:scale-100">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Generate Link'}
                  </Button>
                </CardFooter>
              </div>
            ) : (
              <div className="relative text-center w-full flex flex-col items-center p-6">
                <div className={cn("w-full transition-opacity duration-500 animate-fade-in-up", paymentStatus === 'confirmed' ? "opacity-0" : "opacity-100")}>
                  <h2 className="text-2xl font-bold mb-4">Scan to Pay</h2>
                  <div className="bg-white/90 rounded-2xl p-4 inline-block mb-4">
                    <QRCodeCanvas
                      value={paymentData.link}
                      size={256}
                      bgColor={"#ffffff"}
                      fgColor={"#000000"}
                      level={"L"}
                      includeMargin={false}
                      imageSettings={{
                        src: "https://raw.githubusercontent.com/Core-App/brand-kit/main/Logo/Symbol/PNG/CORE_Symbol_Red_1024x1024.png",
                        x: undefined,
                        y: undefined,
                        height: 48,
                        width: 48,
                        excavate: true,
                      }}
                    />
                  </div>
                  <div className="w-full max-w-sm bg-black/20 rounded-xl p-4 mb-4 space-y-2 text-left text-sm">
                    <div className="flex justify-between"><span className="text-foreground/70">Amount:</span> <span className="font-mono">{paymentData.amount} {paymentData.currency}</span></div>
                    <div className="flex justify-between"><span className="text-foreground/70">To:</span> <span className="font-mono truncate">{paymentData.merchantAddress}</span></div>
                    <div className="flex justify-between items-center">
                      <span className="text-foreground/70">Est. USDC Value:</span> 
                      {paymentData.estimatedUsdc === null ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="font-mono">~${paymentData.estimatedUsdc.toFixed(2)}</span>}
                    </div>
                  </div>

                  {paymentData.insight && (
                    <div className="w-full max-w-sm bg-black/20 rounded-xl p-4 mb-4 text-left text-sm flex items-start gap-3">
                      <Info className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                      <p className="text-foreground/80">{paymentData.insight}</p>
                    </div>
                  )}
                  {paymentData.insight === null && (
                     <div className="w-full max-w-sm bg-black/20 rounded-xl p-4 mb-4 text-left text-sm flex items-start gap-3">
                      <Loader2 className="h-5 w-5 text-accent flex-shrink-0 mt-0.5 animate-spin" />
                      <p className="text-foreground/80">Fetching crypto insight...</p>
                    </div>
                  )}

                  <Button onClick={copyPaymentLink} variant="outline" className="w-full max-w-sm mb-4 bg-accent/20 border-accent/50 hover:bg-accent/30">
                    {isCopying ? <Check className="mr-2 h-4 w-4" /> : <ClipboardCopy className="mr-2 h-4 w-4" />}
                    {isCopying ? 'Copied!' : 'Copy Payment Link'}
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 font-semibold">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse"></div><span>Waiting for payment...</span>
                  </div>
                </div>

                <div className={cn("absolute inset-0 flex flex-col items-center justify-center bg-card/80 backdrop-blur-sm rounded-2xl transition-opacity duration-700", paymentStatus === 'confirmed' ? "opacity-100 animate-fade-in" : "opacity-0 pointer-events-none")}>
                  <CheckCircle className="w-24 h-24 text-green-400 mb-4 animate-pulse" />
                  <h2 className="text-3xl font-bold text-green-400 mb-2">Payment Received!</h2>
                  <p className="text-foreground/80">The transaction has been confirmed.</p>
                </div>
                
                <Button onClick={handleCreateNew} variant="ghost" className="mt-6 text-sm">
                  <ArrowLeft className="mr-2 h-4 w-4"/> Create a new payment link
                </Button>
              </div>
            )}
          </Card>
        </main>

        <section className="w-full max-w-5xl mt-24 md:mt-32 animate-fade-in-up animation-delay-300">
          <h2 className="text-center text-3xl font-bold mb-12">Why VelocityPay?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className={cn("p-6 text-center rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-black/30", glassmorphicCardClass)} style={{ animationDelay: `${i * 150}ms`}}>
                <feature.icon className="h-10 w-10 mx-auto mb-4 text-primary" strokeWidth={1.5} />
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-foreground/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="w-full text-center mt-24 md:mt-32 pb-8">
          <p className="text-sm text-foreground/50">
            © {new Date().getFullYear()} B Dinesh. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
