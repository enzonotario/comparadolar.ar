<script setup lang="ts">
const props = defineProps<{
  title: string;
  buy: Array<{ name: string; price: string }>;
  sell: Array<{ name: string; price: string }>;
  updatedAt?: string;
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
const accentBg = hexToRgba(accent, 0.07);
const accentBorder = hexToRgba(accent, 0.27);
const accentBorderLight = hexToRgba(accent, 0.33);
const accentCircleBg = hexToRgba(accent, 0.1);
const accentBarEnd = hexToRgba(accent, 0.4);
</script>

<template>
  <div
    :style="{
      display: 'flex',
      width: '1200px',
      height: '630px',
      backgroundColor: '#f8fafc',
      backgroundImage: 'url(/assets/logo.png)',
      backgroundSize: '240px auto',
      backgroundPosition: 'center bottom 24px',
      backgroundRepeat: 'no-repeat',
      fontFamily: '\'Inter\', system-ui, sans-serif',
      color: '#0f172a',
      boxSizing: 'border-box',
      position: 'relative',
    }"
  >
    <!-- Gradient orbs -->
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

    <!-- Logo fade overlay -->
    <div
      :style="{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(to bottom, rgba(248,250,252,0.0) 40%, rgba(248,250,252,0.75) 100%)',
        pointerEvents: 'none',
      }"
    />

    <!-- Left accent bar -->
    <div
      :style="{
        display: 'flex',
        width: '6px',
        background: `linear-gradient(180deg, ${accent} 0%, ${accentBarEnd} 100%)`,
        flexShrink: '0',
        position: 'relative',
        zIndex: 1,
      }"
    />

    <!-- Main content -->
    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
        padding: '52px 60px 44px',
        position: 'relative',
        zIndex: 1,
      }"
    >
      <!-- Header -->
      <div
        :style="{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '40px',
        }"
      >
        <div :style="{ display: 'flex', flexDirection: 'column', gap: '6px' }">
          <span
            :style="{
              fontSize: '54px',
              fontWeight: '700',
              color: '#0f172a',
              lineHeight: '1',
              letterSpacing: '-0.02em',
            }"
          >
            {{ title }}
          </span>
        </div>
        <span
          v-if="updatedAt"
          :style="{
            fontSize: '15px',
            color: '#94a3b8',
            paddingBottom: '6px',
          }"
        >
          {{ updatedAt }}
        </span>
      </div>

      <!-- Two columns -->
      <div
        :style="{
          display: 'flex',
          gap: '24px',
          flex: '1',
        }"
      >
        <!-- Comprar column -->
        <div
          :style="{
            display: 'flex',
            flexDirection: 'column',
            flex: '1',
            gap: '12px',
          }"
        >
          <div
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '4px',
            }"
          >
            <div
              :style="{
                display: 'flex',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: accentCircleBg,
                border: `1.5px solid ${accentBorderLight}`,
                alignItems: 'center',
                justifyContent: 'center',
              }"
            >
              <span :style="{ fontSize: '14px', color: accent }">↓</span>
            </div>
            <span
              :style="{
                fontSize: '18px',
                fontWeight: '700',
                color: accent,
                letterSpacing: '0.04em',
              }"
            >
              COMPRAR
            </span>
            <span :style="{ fontSize: '14px', color: '#94a3b8' }"
              >· precio más bajo</span
            >
          </div>

          <div
            v-for="(item, i) in buy.slice(0, 3)"
            :key="i"
            :style="{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: i === 0 ? accentBg : '#ffffff',
              border: `1px solid ${i === 0 ? accentBorder : '#e2e8f0'}`,
              borderRadius: '12px',
              padding: '16px 20px',
            }"
          >
            <span
              :style="{
                fontSize: '13px',
                fontWeight: '700',
                color: i === 0 ? accent : '#cbd5e1',
                width: '22px',
                flexShrink: '0',
              }"
            >
              {{ i + 1 }}
            </span>
            <span
              :style="{
                fontSize: '22px',
                fontWeight: '500',
                color: i === 0 ? '#0f172a' : '#64748b',
                flex: '1',
              }"
            >
              {{ item.name }}
            </span>
            <span
              :style="{
                fontSize: '26px',
                fontWeight: '700',
                color: i === 0 ? accent : '#94a3b8',
                flexShrink: '0',
              }"
            >
              {{ item.price }}
            </span>
          </div>
        </div>

        <!-- Vender column -->
        <div
          :style="{
            display: 'flex',
            flexDirection: 'column',
            flex: '1',
            gap: '12px',
          }"
        >
          <div
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '4px',
            }"
          >
            <div
              :style="{
                display: 'flex',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(245,158,11,0.1)',
                border: '1.5px solid rgba(245,158,11,0.33)',
                alignItems: 'center',
                justifyContent: 'center',
              }"
            >
              <span :style="{ fontSize: '14px', color: '#f59e0b' }">↑</span>
            </div>
            <span
              :style="{
                fontSize: '18px',
                fontWeight: '700',
                color: '#d97706',
                letterSpacing: '0.04em',
              }"
            >
              VENDER
            </span>
            <span :style="{ fontSize: '14px', color: '#94a3b8' }"
              >· precio más alto</span
            >
          </div>

          <div
            v-for="(item, i) in sell.slice(0, 3)"
            :key="i"
            :style="{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: i === 0 ? 'rgba(254,243,199,0.5)' : '#ffffff',
              border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.27)' : '#e2e8f0'}`,
              borderRadius: '12px',
              padding: '16px 20px',
            }"
          >
            <span
              :style="{
                fontSize: '13px',
                fontWeight: '700',
                color: i === 0 ? '#d97706' : '#cbd5e1',
                width: '22px',
                flexShrink: '0',
              }"
            >
              {{ i + 1 }}
            </span>
            <span
              :style="{
                fontSize: '22px',
                fontWeight: '500',
                color: i === 0 ? '#0f172a' : '#64748b',
                flex: '1',
              }"
            >
              {{ item.name }}
            </span>
            <span
              :style="{
                fontSize: '26px',
                fontWeight: '700',
                color: i === 0 ? '#d97706' : '#94a3b8',
                flexShrink: '0',
              }"
            >
              {{ item.price }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- centrado: -->
    <div
      :style="{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#f8fafc',
        borderRadius: '6px',
        padding: '4px 14px',
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
