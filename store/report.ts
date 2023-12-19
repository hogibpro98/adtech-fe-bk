import { ReportStateInterface } from "~/interface/store/report";

export const state = (): ReportStateInterface => ({
  showReportDrawer: false
});

export const mutations = {
  CHANGE_STATUS_REPORT_DRAWER(
    newState: ReportStateInterface,
    newStatus: boolean
  ) {
    newState.showReportDrawer = newStatus;
  },
  TOGGLE_REPORT_DRAWER(newState: ReportStateInterface): void {
    newState.showReportDrawer = !newState.showReportDrawer;
  }
};
