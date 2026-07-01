<template>
  <v-app>
    <v-navigation-drawer permanent color="grey-darken-4">
      <v-list-item title="SaaS İK Yönetimi" subtitle="Kurumsal Panel" class="my-4"></v-list-item>
      <v-divider></v-divider>
      
      <v-list density="compact" nav>
        <v-list-item prepend-icon="mdi-domain" title="Departmanlar" to="/"></v-list-item>
        <v-list-item prepend-icon="mdi-account-multiple" title="Personel Yönetimi" to="/employees"></v-list-item>
        <v-list-item prepend-icon="mdi-cash-register" title="Maaş & Bordrolama" to="/payrolls"></v-list-item>
        <v-list-item title="Geçmiş Ödemeler" prepend-icon="mdi-history" to="/history"></v-list-item>
      <v-list-item prepend-icon="mdi-chart-bar" title="Finansal Analiz" to="/dashboard-analysis" />
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="pa-6">
        <NuxtPage />
      </v-container>
    </v-main>
  </v-app>
</template>