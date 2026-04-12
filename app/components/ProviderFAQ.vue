<script setup lang="ts">
import type { ExchangeRate, ProviderInfo } from "@/lib/types";
import { useAnalytics } from "@/composables/useAnalytics";

const { trackProviderClick } = useAnalytics();

interface Props {
  entity: string;
  currency: string;
  provider: ProviderInfo;
  rateData?: ExchangeRate;
  isLoading?: boolean;
}

const props = defineProps<Props>();

const displayName = computed(
  () => props.provider.prettyName || props.rateData?.prettyName || props.entity,
);
const providerUrl = computed(() => props.provider.url || "#");
const currencySymbol = computed(() => props.currency.toUpperCase());
const isBank = computed(() => props.provider.isBank ?? false);
const isCrypto = computed(() => props.currency !== "usd");

const handleProviderClick = () => {
  trackProviderClick({
    providerName: displayName.value,
    providerUrl: providerUrl.value,
    section: "provider-faq",
    contentType: "button",
  });
};

const faqItems = computed(() => [
  {
    key: "how-it-works",
    label: `¿Cómo funciona la cotización de ${currencySymbol.value} en ${displayName.value}?`,
    content: `${displayName.value} actualiza sus cotizaciones de ${currencySymbol.value} ${props.provider?.is24x7 ? "las 24 horas del día, todos los días del año" : "durante el horario comercial bancario"}. La cotización mostrada incluye el precio de compra (bid) y venta (ask) del ${currencySymbol.value}. El precio de compra es lo que ${displayName.value} te paga cuando vendés ${currencySymbol.value}, y el precio de venta es lo que tenés que pagar cuando comprás ${currencySymbol.value}.`,
  },
  {
    key: "requirements",
    label: `¿Qué requisitos necesito para operar ${currencySymbol.value} en ${displayName.value}?`,
    content: isBank.value
      ? `Para operar ${currencySymbol.value} en ${displayName.value}, necesitás ser cliente del banco o abrirte una cuenta. Los requisitos típicos incluyen: documento de identidad, comprobante de ingresos, y cumplir con las políticas de prevención de lavado de dinero. ${isCrypto.value ? "Para criptomonedas, podés necesitar completar procesos adicionales de verificación." : ""}`
      : `${displayName.value} es una plataforma fintech que requiere registro y verificación de identidad. Necesitás: documento argentino válido, número de teléfono, dirección de email, y completar el proceso de verificación. ${isCrypto.value ? "Para operar criptomonedas, el proceso de verificación puede incluir pasos adicionales de seguridad." : ""}`,
  },
  {
    key: "limits",
    label: `¿Cuáles son los límites para operar ${currencySymbol.value}?`,
    content: `Los límites para operar ${currencySymbol.value} en ${displayName.value} varían según tu nivel de verificación y el tipo de cuenta que tengas. Generalmente, ${isBank.value ? "los bancos tienen límites mensuales que dependen de tus ingresos declarados" : "las fintech tienen límites diarios y mensuales que aumentan con la verificación completa"}. Te recomendamos consultar directamente en la plataforma para conocer tus límites específicos.`,
  },
  {
    key: "schedule",
    label: `¿${displayName.value} opera ${props.provider?.is24x7 ? "las 24 horas?" : "en qué horarios?"}`,
    content: props.provider?.is24x7
      ? `Sí, ${displayName.value} opera las 24 horas del día, los 7 días de la semana. Esto significa que podés operar ${currencySymbol.value} en cualquier momento, incluso fines de semana y feriados. Esta disponibilidad constante es ideal para aprovechar oportunidades del mercado cuando otros proveedores están cerrados.`
      : `${displayName.value} opera durante el horario comercial bancario, generalmente de lunes a viernes de 8:00 a 18:00 horas. Los fines de semana y feriados no hay operaciones disponibles. Es importante planificar tus operaciones de ${currencySymbol.value} dentro de estos horarios.`,
  },
  {
    key: "comparison",
    label: `¿Cómo se compara ${displayName.value} con otros proveedores?`,
    content: `${displayName.value} se destaca por ${props.provider?.is24x7 ? "su disponibilidad 24/7 y" : ""} sus cotizaciones competitivas de ${currencySymbol.value}. ${isBank.value ? "Como entidad bancaria, ofrece la seguridad y respaldo de una institución regulada." : "Como plataforma fintech, se especializa en operaciones digitales rápidas y eficientes."} Para hacer la mejor elección, te recomendamos comparar las cotizaciones actuales con otros proveedores usando nuestro comparador.`,
  },
  {
    key: "security",
    label: `¿Es seguro operar ${currencySymbol.value} en ${displayName.value}?`,
    content: isBank.value
      ? `${displayName.value} es una entidad bancaria regulada por el Banco Central de la República Argentina (BCRA), lo que garantiza el cumplimiento de estrictas normas de seguridad y protección al cliente. Tus operaciones de ${currencySymbol.value} están respaldadas por la regulación financiera argentina.`
      : `${displayName.value} es una empresa fintech que cumple con las regulaciones argentinas para servicios de pago y cambio. Utilizan tecnología de seguridad avanzada y están comprometidos con la protección de datos de sus usuarios. ${isCrypto.value ? "Para criptomonedas, implementan medidas adicionales de seguridad como autenticación de doble factor." : ""}`,
  },
]);
</script>

<template>
  <div class="space-y-12">
    <div class="space-y-4">
      <div class="text-center">
        <UIcon
          name="i-heroicons-question-mark-circle"
          class="size-10 text-indigo-600 dark:text-indigo-400"
        />
        <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Preguntas frecuentes sobre {{ displayName }}
        </h2>
        <p class="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
          Encontrá respuestas a las consultas más comunes sobre cómo operar
          {{ currencySymbol }} en {{ displayName }}.
        </p>
      </div>

      <div class="max-w-4xl mx-auto">
        <UAccordion :items="faqItems"> </UAccordion>
      </div>
    </div>

    <UCard
      class="text-center bg-gradient-to-r from-indigo-50 via-white to-emerald-50 dark:from-indigo-950/30 dark:via-gray-900/50 dark:to-emerald-950/30 border-gray-200/50 dark:border-white/10"
    >
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">
        ¿Tenés más preguntas?
      </h3>
      <p class="text-gray-600 dark:text-white/70 mb-6">
        Si no encontraste la respuesta que buscabas, visitá
        {{ displayName }} directamente para obtener información detallada y
        soporte personalizado.
      </p>
      <UButton
        :to="providerUrl"
        external
        target="_blank"
        rel="noopener noreferrer"
        color="neutral"
        size="lg"
        @click="handleProviderClick"
      >
        <UIcon
          name="i-heroicons-arrow-top-right-on-square"
          class="w-5 h-5 mr-2"
        />
        Contactar {{ displayName }}
      </UButton>
    </UCard>
  </div>
</template>
