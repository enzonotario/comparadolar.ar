<script setup lang="ts">
import type { OgChartLine } from "~/utils/og-data";

const props = defineProps<{
  title: string;
  lines: OgChartLine[];
  yTicks?: string[];
  updatedAt?: string;
  accentColor?: string;
  priceLabel?: string;
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
</script>

<template>
  <div
    :style="{
      display: 'flex',
      width: '1200px',
      height: '630px',
      backgroundColor: '#f8fafc',
      fontFamily: '\'Inter\', system-ui, sans-serif',
      fontFeatureSettings: '\'liga\' 0, \'clig\' 0',
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
        padding: '44px 56px 30px',
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
          marginBottom: '8px',
        }"
      >
        <div :style="{ display: 'flex', flexDirection: 'column', gap: '6px' }">
          <span
            :style="{
              fontSize: '15px',
              fontWeight: '700',
              color: accent,
              letterSpacing: '0.06em',
            }"
          >
            ComparaDolar.ar
          </span>
          <div
            :style="{ display: 'flex', alignItems: 'flex-end', gap: '12px' }"
          >
            <span
              :style="{
                fontSize: '48px',
                fontWeight: '700',
                color: '#0f172a',
                lineHeight: '1',
                letterSpacing: '-0.02em',
              }"
            >
              {{ title }}
            </span>
            <span
              v-if="priceLabel"
              :style="{
                fontSize: '16px',
                fontWeight: '500',
                color: '#94a3b8',
                borderRadius: '8px',
                padding: '4px 10px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#f8fafc',
              }"
            >
              {{ priceLabel }}
            </span>
          </div>
        </div>
        <span
          v-if="updatedAt"
          :style="{
            fontSize: '14px',
            color: '#94a3b8',
            paddingBottom: '4px',
          }"
        >
          {{ updatedAt }}
        </span>
      </div>

      <!-- Chart + axes -->
      <div
        :style="{
          display: 'flex',
          flex: '1',
          flexDirection: 'column',
          gap: '6px',
        }"
      >
        <!-- Legend -->
        <div
          :style="{
            display: 'flex',
            gap: '32px',
          }"
        >
          <div
            v-for="(line, i) in lines"
            :key="i"
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '12px 20px',
              flex: '1',
            }"
          >
            <div
              :style="{
                display: 'flex',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: line.color,
                flexShrink: '0',
              }"
            />
            <span
              :style="{
                fontSize: '18px',
                fontWeight: '500',
                color: '#475569',
                flex: '1',
              }"
            >
              {{ line.name }}
            </span>
            <span
              :style="{
                fontSize: '22px',
                fontWeight: '700',
                color: line.color,
              }"
            >
              {{ line.currentPrice }}
            </span>
          </div>
        </div>

        <!-- Chart row: y-axis labels + chart card -->
        <div :style="{ display: 'flex', flex: '1', gap: '8px' }">
          <!-- Y-axis labels: paddingTop/Bottom=56px + space-between aligns with grid lines at 25/50/75% -->
          <div
            :style="{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              width: '56px',
              paddingRight: '8px',
              paddingTop: '56px',
              paddingBottom: '56px',
              flexShrink: '0',
            }"
          >
            <span
              v-for="(tick, i) in yTicks ?? []"
              :key="i"
              :style="{ fontSize: '12px', color: '#94a3b8' }"
              >{{ tick }}</span
            >
          </div>

          <!-- Chart card -->
          <div
            :style="{
              display: 'flex',
              flexDirection: 'column',
              flex: '1',
              backgroundColor: 'rgba(241,245,249,0.7)',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '14px 16px 14px',
            }"
          >
            <svg width="1000" height="200" viewBox="0 0 960 200">
              <!-- Horizontal grid lines at 25%, 50%, 75% of height -->
              <line
                x1="0"
                y1="50"
                x2="960"
                y2="50"
                stroke="#e2e8f0"
                stroke-width="1"
              />
              <line
                x1="0"
                y1="100"
                x2="960"
                y2="100"
                stroke="#e2e8f0"
                stroke-width="1"
              />
              <line
                x1="0"
                y1="150"
                x2="960"
                y2="150"
                stroke="#e2e8f0"
                stroke-width="1"
              />

              <!-- Day separator lines -->
              <line
                x1="320"
                y1="0"
                x2="320"
                y2="200"
                stroke="#cbd5e1"
                stroke-width="1.5"
                stroke-dasharray="6 3"
              />
              <line
                x1="640"
                y1="0"
                x2="640"
                y2="200"
                stroke="#cbd5e1"
                stroke-width="1.5"
                stroke-dasharray="6 3"
              />

              <!-- Provider lines -->
              <polyline
                v-for="(line, i) in lines"
                :key="i"
                :points="line.svgPoints"
                :stroke="line.color"
                stroke-width="3"
                fill="none"
              />

              <!-- End dots -->
              <template v-for="(line, i) in lines" :key="`dot-${i}`">
                <circle
                  v-if="line.svgPoints"
                  :cx="
                    Number(
                      line.svgPoints.split(' ').at(-1)?.split(',')[0] ?? '0',
                    )
                  "
                  :cy="
                    Number(
                      line.svgPoints.split(' ').at(-1)?.split(',')[1] ?? '0',
                    )
                  "
                  r="5"
                  :fill="line.color"
                />
              </template>
            </svg>
          </div>
        </div>

        <!-- X-axis labels row (offset to align with chart, not y-axis column) -->
        <div
          :style="{
            display: 'flex',
            justifyContent: 'space-between',
            paddingLeft: '64px',
            paddingRight: '0',
          }"
        >
          <span :style="{ fontSize: '12px', color: '#94a3b8' }">hace 3d</span>
          <span :style="{ fontSize: '12px', color: '#94a3b8' }">hace 2d</span>
          <span :style="{ fontSize: '12px', color: '#94a3b8' }">ayer</span>
          <span :style="{ fontSize: '12px', color: '#94a3b8' }">hoy</span>
        </div>

        <!-- logo.png at bottom center -->
        <div
          :style="{
            display: 'flex',
            justifyContent: 'center',
          }"
        >
          <img
            src="/assets/logo.png"
            alt="ComparaDólar"
            :style="{
              width: '96px',
              height: '96px',
            }"
            loading="eager"
            fetchpriority="high"
          />
        </div>
      </div>
    </div>
  </div>
</template>
