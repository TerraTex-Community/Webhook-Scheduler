
export const getInstanceId = () => {

    if (process.env.run_on_kubernetes !== "true") {
        return 0;
    }

    // process.env.pod_name = vlm-backend-0
    // get Instance id form pod_name
    const podName = process.env.pod_name;
    const podNameSplit = podName!.split("-");
    const instanceId = podNameSplit[podNameSplit.length - 1];
    return Number(instanceId);
}