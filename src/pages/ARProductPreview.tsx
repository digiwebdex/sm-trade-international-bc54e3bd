import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import TopBar from '@/components/TopBar';
import Navbar from '@/components/Navbar';
import { Upload, RotateCcw, Box, Cylinder, Circle, Hexagon, Smartphone, X } from 'lucide-react';
import { lazy } from 'react';

const Footer = lazy(() => import('@/components/Footer'));

interface ProductShape {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: typeof Box;
  shape: 'box' | 'cylinder' | 'trophy' | 'plate';
}

const productShapes: ProductShape[] = [
  { id: 'trophy', nameEn: 'Trophy / Award', nameBn: 'ট্রফি / অ্যাওয়ার্ড', icon: Hexagon, shape: 'trophy' },
  { id: 'mug', nameEn: 'Mug / Thermos', nameBn: 'মগ / থার্মোস', icon: Cylinder, shape: 'cylinder' },
  { id: 'box', nameEn: 'Gift Box', nameBn: 'গিফট বক্স', icon: Box, shape: 'box' },
  { id: 'plate', nameEn: 'Crest / Plate', nameBn: 'ক্রেস্ট / প্লেট', icon: Circle, shape: 'plate' },
];

const colorOptions = [
  { name: 'Gold', hex: '#C9A84C' },
  { name: 'Silver', hex: '#B8B8B8' },
  { name: 'Crystal', hex: '#E8F0FE' },
  { name: 'Navy', hex: '#1B2A4A' },
  { name: 'Maroon', hex: '#6B1D2A' },
  { name: 'Black', hex: '#2D2D2D' },
];

// --- 3D Product Components ---

function LogoTexture({ url, position, rotation, scale }: {
  url: string | null;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}) {
  const texture = url ? new THREE.TextureLoader().load(url) : null;
  if (!texture) return null;

  return (
    <mesh position={position} rotation={rotation}>
      <planeGeometry args={[scale[0], scale[1]]} />
      <meshStandardMaterial map={texture} transparent alphaTest={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
}

function TrophyShape({ color, logoUrl }: { color: string; logoUrl: string | null }) {
  return (
    <group>
      {/* Base */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[1.4, 0.3, 0.8]} />
        <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Stem */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 0.9, 16]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Main body */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.2, 1.4, 0.25]} />
        <meshPhysicalMaterial
          color={color}
          metalness={0.3}
          roughness={0.1}
          transmission={color === '#E8F0FE' ? 0.6 : 0}
          thickness={0.5}
        />
      </mesh>
      {/* Logo on front */}
      <LogoTexture url={logoUrl} position={[0, 0.3, 0.14]} rotation={[0, 0, 0]} scale={[0.8, 0.8, 1]} />
    </group>
  );
}

function CylinderShape({ color, logoUrl }: { color: string; logoUrl: string | null }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.55, 0.5, 1.6, 32]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Handle */}
      <mesh position={[0.7, 0.1, 0]} rotation={[0, 0, 0.1]}>
        <torusGeometry args={[0.3, 0.06, 8, 16, Math.PI]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Logo on front */}
      <LogoTexture url={logoUrl} position={[0, 0.1, 0.56]} rotation={[0, 0, 0]} scale={[0.6, 0.6, 1]} />
    </group>
  );
}

function BoxShape({ color, logoUrl }: { color: string; logoUrl: string | null }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[1.6, 1, 1.2]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} />
      </mesh>
      {/* Lid line */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[1.62, 0.02, 1.22]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Logo on front */}
      <LogoTexture url={logoUrl} position={[0, 0, 0.61]} rotation={[0, 0, 0]} scale={[0.9, 0.6, 1]} />
    </group>
  );
}

function PlateShape({ color, logoUrl }: { color: string; logoUrl: string | null }) {
  return (
    <group>
      {/* Back plate */}
      <mesh>
        <cylinderGeometry args={[0.9, 0.9, 0.08, 32]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Rim */}
      <mesh>
        <torusGeometry args={[0.88, 0.04, 8, 32]} />
        <meshStandardMaterial color="#C9A84C" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Logo */}
      <LogoTexture url={logoUrl} position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 1, 1]} />
      {/* Stand */}
      <mesh position={[0, -0.5, -0.3]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.6, 0.8, 0.05]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  );
}

function ProductModel({ shape, color, logoUrl }: { shape: string; color: string; logoUrl: string | null }) {
  switch (shape) {
    case 'trophy': return <TrophyShape color={color} logoUrl={logoUrl} />;
    case 'cylinder': return <CylinderShape color={color} logoUrl={logoUrl} />;
    case 'box': return <BoxShape color={color} logoUrl={logoUrl} />;
    case 'plate': return <PlateShape color={color} logoUrl={logoUrl} />;
    default: return <TrophyShape color={color} logoUrl={logoUrl} />;
  }
}

function Scene({ shape, color, logoUrl, autoRotate }: {
  shape: string; color: string; logoUrl: string | null; autoRotate: boolean;
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-3, 3, -3]} intensity={0.3} />
      <spotLight position={[0, 8, 0]} intensity={0.5} angle={0.5} penumbra={0.5} />

      <group position={[0, shape === 'plate' ? 0.5 : 0, 0]} rotation={shape === 'plate' ? [-0.3, 0, 0] : [0, 0, 0]}>
        <ProductModel shape={shape} color={color} logoUrl={logoUrl} />
      </group>

      <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={6} blur={2.5} />
      <Environment preset="studio" />
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={6}
        autoRotate={autoRotate}
        autoRotateSpeed={1.5}
        makeDefault
      />
    </>
  );
}

// --- Main Page ---

const ARProductPreview = () => {
  const { lang } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedShape, setSelectedShape] = useState(productShapes[0].id);
  const [selectedColor, setSelectedColor] = useState(colorOptions[0].hex);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [arSupported, setArSupported] = useState(false);

  // Check WebXR support
  useEffect(() => {
    if ('xr' in navigator) {
      (navigator as any).xr?.isSessionSupported?.('immersive-ar').then((supported: boolean) => {
        setArSupported(supported);
      }).catch(() => {});
    }
  }, []);

  const handleLogoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'].includes(file.type)) return;
    if (file.size > 5 * 1024 * 1024) return;
    const url = URL.createObjectURL(file);
    setLogoUrl(url);
  }, []);

  const removeLogo = useCallback(() => {
    if (logoUrl) URL.revokeObjectURL(logoUrl);
    setLogoUrl(null);
  }, [logoUrl]);

  const shape = productShapes.find(p => p.id === selectedShape)!;

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <Navbar />

      {/* Hero */}
      <section className="relative bg-primary text-primary-foreground py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 30% 50%, hsl(var(--sm-gold)) 0%, transparent 50%)',
        }} />
        <div className="container mx-auto px-4 relative text-center">
          <span className="inline-block text-accent text-xs font-semibold tracking-[0.25em] uppercase mb-4" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {lang === 'en' ? '3D Product Preview' : '3D পণ্য প্রিভিউ'}
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-3">
            {lang === 'en' ? 'Visualize Your Brand in 3D' : 'আপনার ব্র্যান্ড 3D তে দেখুন'}
          </h1>
          <p className="text-primary-foreground/60 max-w-xl mx-auto" style={{ fontFamily: 'DM Sans, sans-serif' }}>
            {lang === 'en'
              ? 'Upload your logo, pick a product and color — see it come to life in an interactive 3D preview.'
              : 'আপনার লোগো আপলোড করুন, পণ্য ও রঙ নির্বাচন করুন — ইন্টার‌্যাক্টিভ 3D প্রিভিউতে দেখুন।'}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-8">

            {/* Controls — 2 cols */}
            <div className="lg:col-span-2 space-y-6">

              {/* Product shape */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {lang === 'en' ? 'Product Type' : 'পণ্যের ধরন'}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {productShapes.map(p => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedShape(p.id)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          selectedShape === p.id
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-card border border-border/50 text-muted-foreground hover:border-primary/30'
                        }`}
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                      >
                        <Icon className="h-4 w-4" />
                        {lang === 'en' ? p.nameEn : p.nameBn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {lang === 'en' ? 'Material Color' : 'উপকরণের রঙ'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map(c => (
                    <button
                      key={c.hex}
                      onClick={() => setSelectedColor(c.hex)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === c.hex ? 'border-accent scale-110 shadow-lg' : 'border-border/50 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Logo upload */}
              <div>
                <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {lang === 'en' ? 'Your Logo' : 'আপনার লোগো'}
                </h3>
                <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.svg,.webp" onChange={handleLogoUpload} className="hidden" />
                {logoUrl ? (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50">
                    <img src={logoUrl} alt="Logo" className="w-12 h-12 object-contain rounded-lg bg-white p-1" />
                    <span className="text-sm font-medium flex-1" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                      {lang === 'en' ? 'Logo applied' : 'লোগো প্রয়োগ হয়েছে'}
                    </span>
                    <button onClick={removeLogo} className="text-muted-foreground hover:text-destructive">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <Button variant="outline" className="w-full gap-2" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-4 w-4" />
                    {lang === 'en' ? 'Upload Logo (PNG, JPG, SVG)' : 'লোগো আপলোড করুন (PNG, JPG, SVG)'}
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-2" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  {lang === 'en'
                    ? 'Transparent PNG works best for realistic preview.'
                    : 'স্বচ্ছ PNG বাস্তবসম্মত প্রিভিউয়ের জন্য সেরা।'}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => setAutoRotate(prev => !prev)}
                >
                  <RotateCcw className={`h-4 w-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                  {autoRotate
                    ? (lang === 'en' ? 'Stop Rotation' : 'ঘোরানো বন্ধ করুন')
                    : (lang === 'en' ? 'Auto Rotate' : 'অটো রোটেট')}
                </Button>

                {arSupported && (
                  <Button className="w-full gap-2 bg-accent hover:bg-accent/90 text-white">
                    <Smartphone className="h-4 w-4" />
                    {lang === 'en' ? 'View in AR' : 'AR এ দেখুন'}
                  </Button>
                )}
              </div>

              {/* Tip */}
              <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                <p className="text-xs text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                  💡 {lang === 'en'
                    ? 'Drag to rotate, scroll to zoom, pinch on mobile. Upload a transparent PNG logo for the best result.'
                    : 'ঘোরাতে টানুন, জুম করতে স্ক্রল করুন, মোবাইলে পিঞ্চ করুন। সেরা ফলাফলের জন্য স্বচ্ছ PNG লোগো আপলোড করুন।'}
                </p>
              </div>
            </div>

            {/* 3D Canvas — 3 cols */}
            <div className="lg:col-span-3">
              <div className="sticky top-24 rounded-2xl border border-border/50 bg-gradient-to-b from-card to-muted/30 shadow-lg overflow-hidden">
                <div className="bg-primary/5 px-5 py-3 flex items-center justify-between border-b border-border/50">
                  <span className="text-sm font-semibold" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {lang === 'en' ? shape.nameEn : shape.nameBn}
                  </span>
                  <span className="text-xs text-muted-foreground" style={{ fontFamily: 'DM Sans, sans-serif' }}>
                    {lang === 'en' ? 'Interactive 3D Preview' : 'ইন্টার‌্যাক্টিভ 3D প্রিভিউ'}
                  </span>
                </div>
                <div className="aspect-square md:aspect-[4/3] w-full">
                  <Canvas
                    shadows
                    camera={{ position: [0, 1, 4], fov: 45 }}
                    gl={{ antialias: true, alpha: true }}
                  >
                    <Suspense fallback={
                      <Html center>
                        <div className="w-10 h-10 border-2 border-muted-foreground/20 border-t-primary rounded-full animate-spin" />
                      </Html>
                    }>
                      <Scene
                        shape={shape.shape}
                        color={selectedColor}
                        logoUrl={logoUrl}
                        autoRotate={autoRotate}
                      />
                    </Suspense>
                  </Canvas>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Suspense fallback={null}><Footer /></Suspense>
    </div>
  );
};

export default ARProductPreview;
