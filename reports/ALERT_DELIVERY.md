# Local alert delivery

Implemented opt-in Windows desktop notification delivery in the local 15-minute portfolio monitor. A loopback-only control service on 127.0.0.1:3003 is accessed through a localhost-only, same-origin JSON Worker endpoint. Hosted origins and cross-origin changes are rejected. Configuration and seen-event IDs persist under ignored .cache/alert-delivery.

The first check after enabling/changing rules records a baseline without replaying existing alerts. Later fresh live price/volume events and selected non-routine filings are grouped in a Windows tray notification. Repeated IDs are suppressed across checks/restarts. Stale source fallbacks cannot create new events. Saved alert rules and watchlist changes sync when connected; custom watchlist symbols are fetched separately from the fixed 18-company snapshot. Notification failures retain pending events for later retries.

The monitor is running. UI saving disabled delivery and the test-action opt-in guard were verified. Windows Forms/Drawing libraries loaded successfully. Actual notification display and a full scheduled delivery cycle have not been observed; delivery remains off until enabled in Alerts. Send test notification can verify visible delivery after opt-in. Windows notification policies may suppress display despite a successful API invocation.

The server, monitor and Windows computer must remain running. This supports a closed browser tab, not computer shutdown, mobile push, email or hosted background delivery. No OS startup task was installed. Configuration is local to this computer rather than a multi-user account service.

52 tests passed covering rule filtering, baseline/dedup selection, stale suppression, validation, hosted-origin rejection and cross-origin write rejection alongside existing tests. Build and artifact validation passed. No push/deployment.
