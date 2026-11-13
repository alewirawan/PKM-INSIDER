import { OrthographicCamera, Scene, Vector3 } from "three";
import {
  CSS3DObject,
  CSS3DRenderer,
} from "three/addons/renderers/CSS3DRenderer.js";
import { bindOrganizationGestures } from "./organization-gestures";
import type { SchoolLeader } from "../../school-directory-data";
import {
  cardHeight,
  cardWidth,
  layoutOrganization,
} from "./organization-layout";

export function createOrganizationScene(
  host: HTMLElement,
  leaders: SchoolLeader[],
  select: (id: string) => void,
  onZoom: (percent: number) => void = () => {},
) {
  const layout = layoutOrganization(leaders);
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 1, 10000);
  const renderer = new CSS3DRenderer();
  host.append(renderer.domElement);
  const board = document.createElement("div");
  board.className = "organization-plane";
  board.style.width = `${layout.width}px`;
  board.style.height = `${layout.height}px`;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", String(layout.width));
  svg.setAttribute("height", String(layout.height));
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("workspace-connectors");
  board.append(svg);
  const cards = new Map<string, HTMLButtonElement>();
  for (const node of layout.nodes) {
    const parent = layout.nodes.find(
      (p) => p.person.id === node.person.parentId,
    );
    if (parent) {
      const line = document.createElementNS(svg.namespaceURI, "path");
      const y1 = parent.y + cardHeight / 2,
        y2 = node.y - cardHeight / 2;
      const siblings = layout.nodes.filter(
        (p) => p.person.parentId === parent.person.id && !p.person.coordination,
      );
      const stacked =
        siblings.length > 1 &&
        siblings.every((p) => p.x === node.x) &&
        !node.person.coordination;
      line.setAttribute(
        "d",
        node.person.coordination
          ? `M ${parent.x + cardWidth / 2} ${parent.y} H ${node.x - cardWidth / 2}`
          : stacked
            ? `M ${parent.x} ${y1} v 18 H ${node.x - cardWidth / 2 - 16} V ${node.y} H ${node.x - cardWidth / 2}`
            : `M ${parent.x} ${y1} V ${(y1 + y2) / 2} H ${node.x} V ${y2}`,
      );
      line.setAttribute("data-parent", parent.person.id);
      line.setAttribute("data-child", node.person.id);
      if (node.person.coordination)
        line.setAttribute("stroke-dasharray", "8 6");
      svg.append(line);
    }
    const button = document.createElement("button");
    button.type = "button";
    button.className = `workspace-person${node.person.level === "principal" ? " is-principal" : ""}`;
    button.dataset.personId = node.person.id;
    button.style.left = `${node.x - cardWidth / 2}px`;
    button.style.top = `${node.y - cardHeight / 2}px`;
    button.setAttribute("aria-pressed", "false");
    const badge = document.createElement("span");
    badge.className = "workspace-initials";
    badge.textContent = node.person.initials;
    badge.setAttribute("aria-hidden", "true");
    const copy = document.createElement("span");
    const role = document.createElement("small");
    role.textContent = node.person.role;
    const name = document.createElement("strong");
    name.textContent = node.person.name;
    copy.append(role, name);
    button.append(badge, copy);
    button.addEventListener("click", () => select(node.person.id));
    button.addEventListener("focus", () => {
      if (button.matches(":focus-visible")) focus(node.person.id);
    });
    cards.set(node.person.id, button);
    board.append(button);
  }
  scene.add(new CSS3DObject(board));
  let tilted = false;
  let scale = 1;
  let centerX = layout.width / 2,
    centerY = layout.height / 2;
  let width = 0,
    height = 0;
  let overview = true;
  const minimum = () =>
    Math.min((width - 64) / layout.width, (height - 72) / layout.height, 1);
  function clamp() {
    const halfW = width / (2 * scale),
      halfH = height / (2 * scale);
    centerX =
      halfW >= layout.width / 2
        ? layout.width / 2
        : Math.max(halfW - 24, Math.min(layout.width - halfW + 24, centerX));
    centerY =
      halfH >= layout.height / 2
        ? layout.height / 2
        : Math.max(halfH - 24, Math.min(layout.height - halfH + 24, centerY));
  }
  function render() {
    if (!width || !height) return;
    clamp();
    host.dataset.zoom = String(Math.round(scale * 100));
    host.dataset.center = `${Math.round(centerX)},${Math.round(centerY)}`;
    onZoom(Math.round(scale * 100));
    renderer.domElement.style.display = tilted ? "block" : "none";
    if (!tilted) {
      if (board.parentElement !== host) host.append(board);
      board.style.transformOrigin = "0 0";
      board.style.transform = `translate(${width / 2 - centerX * scale}px, ${height / 2 - centerY * scale}px) scale(${scale})`;
      return;
    }
    board.style.transformOrigin = "50% 50%";
    camera.left = -width / 2;
    camera.right = width / 2;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.zoom = scale;
    camera.updateProjectionMatrix();
    const target = new Vector3(
      centerX - layout.width / 2,
      layout.height / 2 - centerY,
      0,
    );
    camera.position.copy(target).add(new Vector3(450, 850, 2200));
    camera.lookAt(target);
    renderer.render(scene, camera);
  }
  function fit() {
    if (!width || !height) return;
    overview = true;
    scale = Math.max(0.05, minimum());
    centerX = layout.width / 2;
    centerY = layout.height / 2;
    render();
  }
  function focus(id: string) {
    const node = layout.nodes.find((p) => p.person.id === id);
    if (!node) {
      fit();
      return;
    }
    overview = false;
    scale = Math.min(1, Math.max(scale, (width - 48) / (cardWidth + 40)));
    centerX = node.x;
    centerY = node.y;
    render();
  }
  function zoom(factor: number) {
    overview = false;
    scale = Math.max(
      Math.max(0.05, minimum() * 0.8),
      Math.min(2, scale / factor),
    );
    render();
  }
  const gestures = bindOrganizationGestures(
    host,
    (x, y) => {
      overview = false;
      centerX += x / scale;
      centerY += y / scale;
      render();
    },
    zoom,
  );
  gestures.enable(false);
  const resize = () => {
    const nextW = host.clientWidth,
      nextH = host.clientHeight;
    if (!nextW || !nextH || (nextW === width && nextH === height)) return;
    width = nextW;
    height = nextH;
    renderer.setSize(width, height);
    if (overview) fit();
    else render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  return {
    fit,
    focus,
    zoom,
    mode(value: boolean) {
      if (tilted === value) return;
      tilted = value;
      if (tilted) {
        scene.clear();
        scene.add(new CSS3DObject(board));
      }
      render();
    },
    select(id: string) {
      cards.forEach((card, key) =>
        card.setAttribute("aria-pressed", String(key === id)),
      );
      svg
        .querySelectorAll("path")
        .forEach((line) =>
          line.classList.toggle(
            "is-highlighted",
            line.getAttribute("data-parent") === id ||
              line.getAttribute("data-child") === id,
          ),
        );
    },
    interact: gestures.enable,
    pan(x: number, y: number) {
      overview = false;
      centerX += ((x * width) / scale) * 0.2;
      centerY -= ((y * height) / scale) * 0.2;
      render();
    },
    dispose() {
      observer.disconnect();
      gestures.dispose();
      board.remove();
      renderer.domElement.remove();
      scene.clear();
    },
  };
}
export type OrganizationScene = ReturnType<typeof createOrganizationScene>;
