<template>
  <div class="max-w-7xl mx-auto px-4 py-12 space-y-12">
    <!-- ProviderHero Skeleton -->
    <div class="space-y-6">
      <!-- Header skeleton -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between">
        <div class="flex items-center gap-4 mb-6 md:mb-0">
          <USkeleton class="h-16 w-16 rounded-full" />
          <div class="space-y-2">
            <USkeleton class="h-8 w-48" />
            <div class="flex items-center gap-2">
              <USkeleton class="h-6 w-32" />
              <USkeleton class="h-6 w-24" />
            </div>
          </div>
        </div>
        <USkeleton class="h-12 w-40" />
      </div>

      <!-- Cards skeleton -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UCard>
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <USkeleton class="h-5 w-5" />
              <USkeleton class="h-6 w-24" />
            </div>
            <USkeleton class="h-10 w-32" />
            <USkeleton class="h-4 w-full" />
          </div>
        </UCard>
        <UCard>
          <div class="space-y-4">
            <div class="flex items-center gap-2">
              <USkeleton class="h-5 w-5" />
              <USkeleton class="h-6 w-24" />
            </div>
            <USkeleton class="h-10 w-32" />
            <USkeleton class="h-4 w-full" />
          </div>
        </UCard>
      </div>

      <!-- Spread card skeleton -->
      <UCard>
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <USkeleton class="h-5 w-5" />
            <USkeleton class="h-5 w-16" />
          </div>
          <div class="text-right space-y-2">
            <USkeleton class="h-6 w-20 ml-auto" />
            <USkeleton class="h-4 w-32 ml-auto" />
          </div>
        </div>
      </UCard>

      <!-- Chart skeleton -->
      <UCard>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <USkeleton class="h-6 w-48" />
            <div class="flex gap-2">
              <USkeleton class="h-8 w-16" />
              <USkeleton class="h-8 w-16" />
              <USkeleton class="h-8 w-16" />
            </div>
          </div>
          <USkeleton class="h-64 w-full" />
        </div>
      </UCard>
    </div>

    <!-- ProviderInfoSection Skeleton -->
    <div class="space-y-12">
      <div class="text-center space-y-4">
        <USkeleton class="h-8 w-64 mx-auto" />
        <USkeleton class="h-5 w-96 mx-auto" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard v-for="i in 3" :key="i">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <USkeleton class="h-6 w-6" />
              <USkeleton class="h-6 w-20" />
            </div>
            <USkeleton class="h-6 w-40" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-3/4" />
          </div>
        </UCard>
      </div>

      <UCard>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div v-for="i in 3" :key="i" class="space-y-2">
            <USkeleton class="h-8 w-16 mx-auto" />
            <USkeleton class="h-5 w-32 mx-auto" />
          </div>
        </div>
      </UCard>

      <div class="text-center space-y-4">
        <USkeleton class="h-7 w-96 mx-auto" />
        <USkeleton class="h-5 w-full max-w-xl mx-auto" />
        <USkeleton class="h-12 w-40 mx-auto" />
      </div>
    </div>

    <!-- RelatedProviders Skeleton -->
    <div class="space-y-12">
      <div class="text-center space-y-4">
        <USkeleton class="h-8 w-80 mx-auto" />
        <USkeleton class="h-5 w-96 mx-auto" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <UCard v-for="i in 6" :key="i">
          <div class="space-y-4">
            <div class="flex items-center gap-3">
              <USkeleton class="h-12 w-12 rounded-full" />
              <div class="space-y-2 flex-1">
                <USkeleton class="h-5 w-24" />
                <USkeleton class="h-5 w-28" />
              </div>
            </div>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <USkeleton class="h-4 w-16" />
                <USkeleton class="h-5 w-20" />
              </div>
              <div class="flex justify-between items-center">
                <USkeleton class="h-4 w-16" />
                <USkeleton class="h-5 w-20" />
              </div>
            </div>
            <div class="pt-4 border-t border-gray-200 dark:border-white/10">
              <div class="flex items-center justify-between">
                <USkeleton class="h-4 w-20" />
                <USkeleton class="h-4 w-4" />
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <UCard>
        <div class="text-center space-y-4">
          <USkeleton class="h-6 w-6 mx-auto" />
          <USkeleton class="h-7 w-80 mx-auto" />
          <USkeleton class="h-5 w-full max-w-xl mx-auto" />
          <USkeleton class="h-12 w-56 mx-auto" />
        </div>
      </UCard>
    </div>

    <!-- ProviderFAQ Skeleton -->
    <div class="space-y-12">
      <div class="text-center space-y-4">
        <USkeleton class="h-10 w-10 mx-auto rounded-full" />
        <USkeleton class="h-8 w-96 mx-auto" />
        <USkeleton class="h-5 w-full max-w-2xl mx-auto" />
      </div>

      <div class="max-w-4xl mx-auto space-y-4">
        <UCard v-for="i in 6" :key="i">
          <div class="space-y-2">
            <USkeleton class="h-6 w-full" />
            <USkeleton class="h-4 w-3/4" />
          </div>
        </UCard>
      </div>

      <UCard>
        <div class="text-center space-y-4">
          <USkeleton class="h-6 w-64 mx-auto" />
          <USkeleton class="h-5 w-full max-w-xl mx-auto" />
          <USkeleton class="h-12 w-52 mx-auto" />
        </div>
      </UCard>
    </div>
  </div>
</template>
