<template>
  <display-card
    title="Cơ cấu người dùng"
    :loading="loadingData"
    redirect="/admin/user"
    url="/summary/role-stats"
  >
    <mini-statistic
      :number="agency"
      icon="support_agent"
      title="Agency"
      sub-title="người dùng"
      color="red"
    />
    <mini-statistic
      :number="advertiser"
      icon="business_center"
      title="Advertiser"
      sub-title="người dùng"
      color="purple"
    />
    <mini-statistic
      :number="inspector"
      icon="person_search"
      title="Đối soát viên"
      sub-title="người dùng"
      color="green"
    />
  </display-card>
</template>
<script lang="ts">
import MiniStatistic from "@/components/widgets/statistic/MiniStatistic.vue";
import DisplayCard from "@/components/common/DisplayCard.vue";
import Vue, { VueConstructor } from "vue";
import GlobalDataInterface from "~/interface/data/global";

interface ComponentData extends GlobalDataInterface {
  agency: number;
  advertiser: number;
  inspector: number;
  clicks: number;
  views: number;
  loadingData: boolean;
  params: object;
}

interface ComponentMethods {
  fetchData(): void;
}

const RoleStats = (Vue as VueConstructor<
  Vue & ComponentData & ComponentMethods
>).extend({
  name: "RoleStats",
  components: {
    DisplayCard,
    MiniStatistic
  },
  data() {
    return {
      agency: 0,
      advertiser: 0,
      inspector: 0,
      clicks: 0,
      views: 0,
      loadingData: false
    };
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    async fetchData() {
      this.loadingData = true;
      const { data } = await this.$axios.$post(
        "/summary/role-stats",
        this.params
      );
      this.agency = data.agency;
      this.advertiser = data.advertiser;
      this.inspector = data.inspector;
      this.loadingData = false;
    }
  }
});

export default RoleStats;
export type RoleStatsRef = InstanceType<typeof RoleStats>;
</script>
<style>
.ministats-wrapper {
  height: 100%;
  padding: 16px;
}
</style>
