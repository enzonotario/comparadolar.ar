<script setup lang="ts">
const props = defineProps<{
  title: string;
  rows: Array<{ name: string; buy: string; sell: string }>;
  accentColor?: string;
  updatedAt?: string;
}>();

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const accent = props.accentColor ?? "#10b981";
const accentDim = hexToRgba(accent, 0.12);
const accentBorder = hexToRgba(accent, 0.28);
const accentMuted = hexToRgba(accent, 0.45);
</script>

<template>
  <div
    :style="{
      display: 'flex',
      flexDirection: 'column',
      width: '1200px',
      height: '630px',
      backgroundColor: '#0e1117',
      fontFamily: '\'Courier New\', Courier, monospace',
      color: '#c9d1d9',
      boxSizing: 'border-box',
      position: 'relative',
    }"
  >
    <!-- Titlebar -->
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        height: '48px',
        backgroundColor: '#161b22',
        borderBottom: `1px solid ${accentBorder}`,
        padding: '0 28px',
        flexShrink: '0',
        gap: '10px',
      }"
    >
      <div :style="{ display: 'flex', gap: '7px', alignItems: 'center' }">
        <div
          :style="{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ff5f57',
          }"
        />
        <div
          :style="{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#ffbd2e',
          }"
        />
        <div
          :style="{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#28c840',
          }"
        />
      </div>
      <span
        :style="{
          fontSize: '14px',
          color: accent,
          fontWeight: '700',
          marginLeft: '20px',
          letterSpacing: '0.12em',
        }"
      >
        RATES MONITOR — {{ title }}
      </span>
    </div>

    <!-- Main content -->
    <div
      :style="{
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
        padding: '36px 52px 28px',
      }"
    >
      <!-- Header line -->
      <div
        :style="{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '28px',
        }"
      >
        <div :style="{ display: 'flex', flexDirection: 'column', gap: '6px' }">
          <span
            :style="{
              fontSize: '13px',
              color: accentMuted,
              letterSpacing: '0.06em',
            }"
            >comparadolar.ar</span
          >
          <span
            :style="{
              fontSize: '36px',
              fontWeight: '700',
              color: accent,
              letterSpacing: '0.04em',
            }"
          >
            $ {{ title }}
          </span>
        </div>
        <span
          v-if="updatedAt"
          :style="{ fontSize: '13px', color: '#484f58', paddingBottom: '4px' }"
        >
          {{ updatedAt }}
        </span>
      </div>

      <!-- Table header -->
      <div
        :style="{
          display: 'flex',
          padding: '0 0 10px',
          borderBottom: `1px solid ${accentBorder}`,
          marginBottom: '2px',
        }"
      >
        <span
          :style="{
            fontSize: '12px',
            color: '#484f58',
            letterSpacing: '0.1em',
            width: '28px',
            flexShrink: '0',
          }"
        />
        <span
          :style="{
            fontSize: '12px',
            color: '#484f58',
            letterSpacing: '0.1em',
            flex: '1',
          }"
          >PROVEEDOR</span
        >
        <span
          :style="{
            fontSize: '12px',
            color: '#484f58',
            letterSpacing: '0.1em',
            width: '180px',
          }"
          >COMPRAR</span
        >
        <span
          :style="{
            fontSize: '12px',
            color: '#484f58',
            letterSpacing: '0.1em',
            width: '180px',
          }"
          >VENDER</span
        >
      </div>

      <!-- Rows -->
      <div
        v-for="(row, i) in rows.slice(0, 5)"
        :key="i"
        :style="{
          display: 'flex',
          alignItems: 'center',
          padding: '13px 8px',
          backgroundColor: i === 0 ? accentDim : 'transparent',
          borderBottom: `1px solid ${hexToRgba(accent, 0.08)}`,
          borderRadius: i === 0 ? '4px' : '0',
        }"
      >
        <span
          :style="{
            fontSize: '16px',
            color: accent,
            width: '28px',
            flexShrink: '0',
          }"
          >{{ i === 0 ? ">" : " " }}</span
        >
        <span
          :style="{
            fontSize: '21px',
            color: i === 0 ? '#e6edf3' : '#6e7681',
            flex: '1',
          }"
          >{{ row.name }}</span
        >
        <span
          :style="{
            fontSize: '22px',
            fontWeight: '700',
            color: i === 0 ? accent : '#484f58',
            width: '180px',
          }"
          >{{ row.buy }}</span
        >
        <span
          :style="{
            fontSize: '22px',
            fontWeight: '700',
            color: i === 0 ? '#e6edf3' : '#484f58',
            width: '180px',
          }"
          >{{ row.sell }}</span
        >
      </div>
    </div>

    <!-- Bottom bar -->
    <div
      :style="{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        padding: '0 52px',
        height: '40px',
        borderTop: `1px solid ${accentBorder}`,
        flexShrink: '0',
      }"
    >
      <span
        :style="{
          fontSize: '13px',
          color: accentMuted,
          letterSpacing: '0.1em',
        }"
      >
        comparadolar.ar
      </span>
    </div>
  </div>
</template>
