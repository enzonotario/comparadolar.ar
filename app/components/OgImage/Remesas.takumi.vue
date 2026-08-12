<script setup lang="ts">
defineProps<{
  title: string;
  subtitle: string;
  updatedAt?: string;
  items: Array<{
    name: string;
    currency: string;
    rating: string;
    receiveCost: string;
    arsWithdrawal: string;
    vendesA?: string;
  }>;
}>();
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
    <div
      :style="{
        position: 'absolute',
        top: '-150px',
        right: '-150px',
        width: '550px',
        height: '550px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }"
    />

    <div
      :style="{
        position: 'absolute',
        inset: 0,
        background:
          'linear-gradient(to bottom, rgba(248,250,252,0.0) 40%, rgba(248,250,252,0.75) 100%)',
        pointerEvents: 'none',
      }"
    />

    <div
      :style="{
        position: 'relative',
        zIndex: 1,
        display: 'grid',
        gridTemplateColumns: '400px 1fr',
        gap: '26px',
        width: '100%',
        height: '100%',
        padding: '52px 56px',
        boxSizing: 'border-box',
      }"
    >
      <div :style="{ display: 'flex', flexDirection: 'column' }">
        <div :style="{ fontSize: '18px', color: '#475569', fontWeight: '800' }">
          ComparaDolar.ar
        </div>

        <h1
          :style="{
            margin: '18px 0 0 0',
            fontSize: '70px',
            lineHeight: '0.9',
            letterSpacing: '-0.06em',
            fontWeight: '900',
            color: '#020617',
          }"
        >
          {{ title }}
        </h1>

        <p
          :style="{
            margin: '18px 0 0 0',
            fontSize: '24px',
            lineHeight: '1.28',
            color: '#334155',
            maxWidth: '340px',
          }"
        >
          {{ subtitle }}
        </p>

        <div
          :style="{
            marginTop: '22px',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(148, 163, 184, 0.16)',
            padding: '10px 14px',
            color: '#64748b',
            fontSize: '14px',
            fontWeight: '700',
          }"
        >
          Top 3 · Precio de venta
        </div>

        <div
          v-if="updatedAt"
          :style="{
            marginTop: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            borderRadius: '999px',
            background: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(148, 163, 184, 0.14)',
            padding: '9px 14px',
            color: '#64748b',
            fontSize: '13px',
            fontWeight: '700',
          }"
        >
          Actualizado {{ updatedAt }}
        </div>
      </div>

      <div :style="{ display: 'grid', gap: '14px', alignContent: 'start' }">
        <div
          v-for="(item, index) in items.slice(0, 3)"
          :key="`${item.name}-${index}`"
          :style="{
            display: 'grid',
            gridTemplateColumns: '1fr 170px',
            gap: '14px',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.92)',
            border: '1px solid rgba(148, 163, 184, 0.16)',
            boxShadow: '0 14px 30px rgba(15, 23, 42, 0.06)',
            padding: '18px 20px',
          }"
        >
          <div :style="{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }">
            <div :style="{ display: 'flex', alignItems: 'center', gap: '10px' }">
              <div
                :style="{
                  width: '34px',
                  height: '34px',
                  borderRadius: '999px',
                  background:
                    index === 0
                      ? 'linear-gradient(135deg, #a7f3d0 0%, #6ee7b7 100%)'
                      : 'rgba(226,232,240,0.95)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '15px',
                  fontWeight: '900',
                  color: '#0f172a',
                }"
              >
                {{ index + 1 }}
              </div>

              <div>
                <div :style="{ fontSize: '28px', fontWeight: '900', color: '#020617' }">
                  {{ item.name }}
                </div>
                <div :style="{ marginTop: '2px', fontSize: '14px', color: '#64748b' }">
                  {{ item.currency }}
                </div>
              </div>
            </div>

            <div :style="{ display: 'flex', gap: '10px', marginTop: '14px' }">
              <div
                :style="{
                  borderRadius: '16px',
                  padding: '10px 12px',
                  background: 'rgba(220, 38, 38, 0.08)',
                  color: '#dc2626',
                }"
              >
                <div :style="{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }">
                  Precio de venta
                </div>
                <div :style="{ marginTop: '6px', fontSize: '22px', fontWeight: '900' }">
                  {{ item.vendesA || '—' }}
                </div>
              </div>

              <div
                :style="{
                  borderRadius: '16px',
                  padding: '10px 12px',
                  background:
                    item.arsWithdrawal === '0' ||
                    item.arsWithdrawal === '0%' ||
                    item.arsWithdrawal === '0 USD'
                      ? 'rgba(16,185,129,0.12)'
                      : 'rgba(239,68,68,0.10)',
                  color:
                    item.arsWithdrawal === '0' ||
                    item.arsWithdrawal === '0%' ||
                    item.arsWithdrawal === '0 USD'
                      ? '#047857'
                      : '#dc2626',
                }"
              >
                <div :style="{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }">
                  Retiro ARS
                </div>
                <div :style="{ marginTop: '6px', fontSize: '22px', fontWeight: '900' }">
                  {{ item.arsWithdrawal }}
                </div>
              </div>
            </div>
          </div>

          <div
            :style="{
              borderRadius: '20px',
              background:
                'linear-gradient(180deg, rgba(236,253,245,0.95) 0%, rgba(255,255,255,0.95) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.18)',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }"
          >
            <div
              :style="{
                fontSize: '11px',
                color: '#64748b',
                fontWeight: '800',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }"
            >
              Rating
            </div>
            <div
              :style="{
                marginTop: '10px',
                fontSize: '42px',
                lineHeight: '1',
                fontWeight: '900',
                color: '#047857',
              }"
            >
              {{ item.rating }}
            </div>
            <div
              :style="{ marginTop: '8px', fontSize: '14px', color: '#64748b', fontWeight: '700' }"
            >
              sobre 5,00
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
