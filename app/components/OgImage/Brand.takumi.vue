<script setup lang="ts">
const props = defineProps<{
  title: string;
  accentColor?: string;
}>();

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const accent = props.accentColor ?? "#10b981";
const accentFaint = hexToRgba(accent, 0.12);
const accentMid = hexToRgba(accent, 0.07);
const accentBarEnd = hexToRgba(accent, 0.4);
const accentSoft = hexToRgba(accent, 0.18);
</script>

<template>
  <div
    :style="{
      display: 'flex',
      width: '1200px',
      height: '630px',
      backgroundColor: '#f8fafc',
      fontFamily: '\'Inter\', system-ui, sans-serif',
      color: '#0f172a',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Mismos gradientes orb que ComparaDolar -->
    <div
      :style="{
        position: 'absolute',
        top: '-150px',
        right: '-150px',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accentFaint} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }"
    />
    <div
      :style="{
        position: 'absolute',
        bottom: '-100px',
        left: '-100px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accentMid} 0%, transparent 70%)`,
        pointerEvents: 'none',
      }"
    />

    <!-- Barra lateral (misma que el resto de OGs) -->
    <div
      :style="{
        display: 'flex',
        width: '6px',
        background: `linear-gradient(180deg, ${accent} 0%, ${accentBarEnd} 100%)`,
        flexShrink: '0',
        position: 'relative',
        zIndex: '2',
      }"
    />

    <!-- Columna logo: grabado en color real + halo suave -->
    <div
      :style="{
        width: '500px',
        flexShrink: '0',
        position: 'relative',
        zIndex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 8px 40px 36px',
      }"
    >
      <div
        :style="{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${accentSoft} 0%, transparent 68%)`,
          pointerEvents: 'none',
        }"
      />
      <div
        :style="{
          position: 'relative',
          width: '100%',
          height: '520px',
          backgroundImage: 'url(/assets/logo.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          filter:
            'drop-shadow(0 2px 8px rgba(15, 23, 42, 0.06)) drop-shadow(0 12px 28px rgba(15, 23, 42, 0.04))',
        }"
      />
    </div>

    <!-- Texto -->
    <div
      :style="{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px 56px 88px 24px',
        gap: '28px',
        position: 'relative',
        zIndex: '2',
      }"
    >
      <p
        :style="{
          margin: '0',
          fontSize: '28px',
          fontWeight: '700',
          fontStyle: 'italic',
          color: accent,
          lineHeight: '1.25',
          letterSpacing: '0.02em',
          maxWidth: '520px',
        }"
      >
        CAMBIÁ DONDE MÁS TE CONVIENE
      </p>

      <div :style="{ display: 'flex', flexDirection: 'column', gap: '10px' }">
        <span
          :style="{
            fontSize: '56px',
            fontWeight: '700',
            color: '#0f172a',
            lineHeight: '1',
            letterSpacing: '-0.02em',
          }"
        >
          {{ title }}
        </span>
        <div
          :style="{
            height: '6px',
            width: '400px',
            background: `linear-gradient(90deg, ${accent} 0%, ${accentBarEnd} 100%)`,
            borderRadius: '3px',
          }"
        />
        <span
          :style="{
            fontSize: '18px',
            fontWeight: '600',
            color: '#64748b',
            letterSpacing: '0.04em',
          }"
        >
          comparadolar.ar
        </span>
      </div>
    </div>

    <!-- Badge inferior (mismo patrón que ComparaDolar) -->
    <div
      :style="{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        padding: '4px 14px',
        zIndex: '2',
      }"
    >
      <span
        :style="{
          fontSize: '17px',
          color: accent,
          fontWeight: '600',
          letterSpacing: '0.08em',
        }"
      >
        ComparaDolar.ar
      </span>
    </div>
  </div>
</template>
