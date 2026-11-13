export function bindOrganizationGestures(
  host: HTMLElement,
  pan: (x: number, y: number) => void,
  zoom: (factor: number) => void,
) {
  let enabled = false;
  let pointer: { id: number; x: number; y: number; moved: boolean } | null =
    null;
  let suppressClick = false;
  const down = (event: PointerEvent) => {
    if (!enabled || event.button !== 0 || !event.isPrimary) return;
    pointer = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      moved: false,
    };
    suppressClick = false;
  };
  const move = (event: PointerEvent) => {
    if (!pointer || pointer.id !== event.pointerId) return;
    const x = event.clientX - pointer.x,
      y = event.clientY - pointer.y;
    if (!pointer.moved && Math.hypot(x, y) < 6) return;
    pointer.moved = true;
    suppressClick = true;
    host.setPointerCapture(event.pointerId);
    host.dataset.dragging = "true";
    pan(-x, -y);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  };
  const up = (event: PointerEvent) => {
    if (pointer?.id !== event.pointerId) return;
    if (host.hasPointerCapture(event.pointerId))
      host.releasePointerCapture(event.pointerId);
    pointer = null;
    delete host.dataset.dragging;
  };
  const click = (event: MouseEvent) => {
    if (suppressClick && event.detail > 0) {
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    }
  };
  const wheel = (event: WheelEvent) => {
    if (!enabled || !event.ctrlKey) return;
    event.preventDefault();
    zoom(event.deltaY > 0 ? 1.08 : 1 / 1.08);
  };
  host.addEventListener("pointerdown", down);
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerup", up);
  host.addEventListener("pointercancel", up);
  host.addEventListener("lostpointercapture", up);
  host.addEventListener("click", click, true);
  host.addEventListener("wheel", wheel, { passive: false });
  return {
    enable(value: boolean) {
      enabled = value;
      if (!value && pointer) {
        if (host.hasPointerCapture(pointer.id))
          host.releasePointerCapture(pointer.id);
        pointer = null;
      }
      host.style.touchAction = value ? "none" : "pan-y";
      host.dataset.interactive = String(value);
    },
    dispose() {
      host.removeEventListener("pointerdown", down);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerup", up);
      host.removeEventListener("pointercancel", up);
      host.removeEventListener("lostpointercapture", up);
      host.removeEventListener("click", click, true);
      host.removeEventListener("wheel", wheel);
    },
  };
}
