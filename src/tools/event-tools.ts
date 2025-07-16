import { BaseTool, type ToolArguments } from "./base-tool";
import type { ToolResponse, EventInfo } from "../types/index";

export class MonitorEventsTool extends BaseTool {
  readonly name = "monitor_events";
  readonly description =
    "Monitor real-time Ring events (doorbell presses, motion detection, etc.)";
  readonly inputSchema = {
    type: "object",
    properties: {
      duration: {
        type: "number",
        description: "Duration in seconds to monitor events (default: 30)",
      },
    },
  } as const;

  async execute(args?: ToolArguments): Promise<ToolResponse> {
    this.validateRingApi();

    const duration = (args?.duration as number) || 30;
    const events: EventInfo[] = [];
    const startTime = Date.now();
    const locations = await this.ringApi.getLocations();

    // Set up subscriptions for each location and device before starting the Promise
    for (const location of locations) {
      // Monitor camera events
      for (const camera of location.cameras) {
        camera.onNewNotification.subscribe((notification: any) => {
          events.push({
            type: "camera_notification",
            timestamp: new Date().toISOString(),
            device: camera.name,
            deviceId: camera.id,
            notificationKind: notification.kind,
            data: notification,
          });
        });

        camera.onMotionDetected.subscribe((motion: any) => {
          events.push({
            type: "motion_detected",
            timestamp: new Date().toISOString(),
            device: camera.name,
            deviceId: camera.id,
            data: motion,
          });
        });

        if (
          camera.deviceType === "hp_cam_v1" ||
          camera.name.toLowerCase().includes("doorbell")
        ) {
          camera.onDoorbellPressed.subscribe((press: any) => {
            events.push({
              type: "doorbell_pressed",
              timestamp: new Date().toISOString(),
              device: camera.name,
              deviceId: camera.id,
              data: press,
            });
          });
        }
      }

      // Monitor other device events if they have notification support
      try {
        const devices = await location.getDevices();
        for (const device of devices) {
          // Only subscribe to notifications if the device supports it
          if ("onNewNotification" in device) {
            (device as any).onNewNotification.subscribe((notification: any) => {
              events.push({
                type: "device_notification",
                timestamp: new Date().toISOString(),
                device: device.name,
                deviceId: device.id,
                deviceType: device.deviceType,
                data: notification,
              });
            });
          }
        }
      } catch (error) {
        console.error(
          "[Ring MCP] Error setting up device notifications:",
          error
        );
      }
    }

    return new Promise((resolve) => {
      // End monitoring after specified duration
      setTimeout(() => {
        const endTime = Date.now();
        const result = {
          monitoringDuration: `${duration} seconds`,
          actualDuration: `${(endTime - startTime) / 1000} seconds`,
          eventsDetected: events.length,
          events,
        };

        resolve({
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        });
      }, duration * 1000);
    });
  }
}
