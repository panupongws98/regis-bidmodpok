const fs = require("fs");
const filePath = "public/app.js";
let source = fs.readFileSync(filePath, "utf8");

const helperReplacement = String.raw`function buildEvenlySpacedCenters(count, topY, bottomY) {
  const safeCount = Math.max(1, count);
  if (safeCount === 1) {
    return [(topY + bottomY) / 2];
  }

  const availableHeight = bottomY - topY;
  const maxStep = 156;
  let step = availableHeight / (safeCount - 1);
  step = Math.min(step, maxStep);
  const contentHeight = step * (safeCount - 1);
  const startY = topY + (availableHeight - contentHeight) / 2;

  return Array.from({ length: safeCount }, (_, index) => {
    return startY + step * index;
  });
}

function buildNextRoundCenters(previousCenters) {
  if (previousCenters.length <= 1) {
    return [...previousCenters];
  }

  const centers = [];
  for (let index = 0; index < previousCenters.length; index += 2) {
    const topCenter = previousCenters[index];
    const bottomCenter = previousCenters[Math.min(index + 1, previousCenters.length - 1)];
    centers.push((topCenter + bottomCenter) / 2);
  }

  return centers;
}

function getBracketPageLayouts(pageGroup, topY, bottomY) {
  const layouts = new Array(pageGroup.columns.length);
  const baseIndex = pageGroup.columns[0].type === "qualifying" && pageGroup.columns.length > 1
    ? 1
    : 0;

  layouts[baseIndex] = buildEvenlySpacedCenters(
    pageGroup.columns[baseIndex].count,
    topY,
    bottomY,
  );

  for (let index = baseIndex + 1; index < pageGroup.columns.length; index += 1) {
    layouts[index] = buildNextRoundCenters(layouts[index - 1]);
  }

  if (baseIndex === 1) {
    const mainCenters = layouts[1];
    const mainStep = mainCenters.length > 1 ? Math.abs(mainCenters[1] - mainCenters[0]) : 120;
    const qualifierOffset = Math.max(24, Math.min(76, mainStep / 2));
    const qualifierCenters = [];

    for (const slotIndex of pageGroup.columns[0].nextSlotIndices || []) {
      const targetCenter = mainCenters[slotIndex];
      qualifierCenters.push(targetCenter - qualifierOffset, targetCenter + qualifierOffset);
    }

    layouts[0] = qualifierCenters;
  }

  return pageGroup.columns.map((column, index) => {
    const centers = layouts[index];
    const localStep = centers.length > 1
      ? Math.abs(centers[1] - centers[0])
      : index > 0 && layouts[index - 1].length > 1
        ? Math.abs(layouts[index - 1][1] - layouts[index - 1][0])
        : 96;
    const boxHeight = Math.max(16, Math.min(32, localStep * 0.55));
    const fontSize = Math.max(8, Math.min(12, boxHeight * 0.62));

    return {
      ...column,
      centers,
      boxHeight,
      fontSize,
    };
  });
}

function buildBracketPage(`;

source = source.replace(/function getBracketColumnLayout[\s\S]*?function buildBracketPage\(/, helperReplacement);

const pageReplacement = String.raw`function buildBracketPage(className, entries, allColumns, pageGroup, pageNumber, totalPages) {
  const viewBoxWidth = 1120;
  const viewBoxHeight = 1140;
  const leftX = 28;
  const columnCount = pageGroup.columns.length;
  const rightPadding = 32;
  const boxWidth = columnCount >= 4 ? 168 : columnCount === 3 ? 204 : columnCount === 2 ? 240 : 276;
  const titleY = 44;
  const infoY = 72;
  const labelY = 112;
  const topY = 146;
  const bottomY = 1088;
  const xStep = columnCount > 1
    ? (viewBoxWidth - leftX - rightPadding - boxWidth) / (columnCount - 1)
    : 0;

  const pageLayouts = getBracketPageLayouts(pageGroup, topY, bottomY);
  const layoutColumns = pageLayouts.map((column, index) => {
    return {
      ...column,
      absoluteIndex: pageGroup.startIndex + index,
      x: leftX + xStep * index,
    };
  });

  const boxes = [];
  const connectors = [];
  const labels = [];
  const pageTitle = \`รุ่น \${className || "-"}\`;
  const pageNote = \`ผู้ลงจริง \${entries.length} คัน | หน้า \${pageNumber} / \${totalPages}\`;

  labels.push(\`<text x="\${leftX}" y="\${titleY}" class="bracket-title">\${escapeHtml(pageTitle)}</text>\`);
  labels.push(\`<text x="\${leftX}" y="\${infoY}" class="bracket-page-note">\${escapeHtml(pageNote)}</text>\`);

  layoutColumns.forEach((column) => {
    labels.push(\`<text x="\${column.x}" y="\${labelY}" class="bracket-round-label">\${escapeHtml(column.label)}</text>\`);
    if (column.note) {
      labels.push(\`<text x="\${column.x}" y="\${labelY + 18}" class="bracket-page-note">\${escapeHtml(column.note)}</text>\`);
    }

    column.slots.forEach((slot, slotIndex) => {
      const centerY = column.centers[slotIndex];
      const compactLabelLength = column.boxHeight < 18 ? 12 : column.boxHeight < 22 ? 16 : 20;
      const text = slot.text ? shortenText(slot.text, compactLabelLength) : "";
      boxes.push(
        renderBracketBox(
          column.x,
          centerY - column.boxHeight / 2,
          boxWidth,
          column.boxHeight,
          text,
          {
            className: slot.className,
            fontSize: column.fontSize,
            paddingX: column.boxHeight < 18 ? 6 : 8,
          },
        ),
      );
    });
  });

  for (let localIndex = 0; localIndex < layoutColumns.length - 1; localIndex += 1) {
    const currentColumn = layoutColumns[localIndex];
    const nextColumn = layoutColumns[localIndex + 1];
    const currentFullColumn = allColumns[currentColumn.absoluteIndex];
    const nextFullColumn = allColumns[nextColumn.absoluteIndex];

    if (currentFullColumn.type === "qualifying" && nextFullColumn.type === "main") {
      const totalMatches = currentFullColumn.count / 2;
      for (let matchIndex = 0; matchIndex < totalMatches; matchIndex += 1) {
        const topYPosition = currentColumn.centers[matchIndex * 2];
        const bottomYPosition = currentColumn.centers[matchIndex * 2 + 1];
        const targetSlotIndex = currentFullColumn.nextSlotIndices[matchIndex];
        const targetY = nextColumn.centers[targetSlotIndex];

        if (typeof topYPosition !== "number" || typeof bottomYPosition !== "number" || typeof targetY !== "number") {
          continue;
        }

        connectors.push(
          renderBracketPairConnector(
            currentColumn.x + boxWidth,
            topYPosition,
            bottomYPosition,
            nextColumn.x,
            targetY,
          ),
        );
      }

      continue;
    }

    const totalMatches = nextFullColumn.count;
    for (let matchIndex = 0; matchIndex < totalMatches; matchIndex += 1) {
      const topYPosition = currentColumn.centers[matchIndex * 2];
      const bottomYPosition = currentColumn.centers[matchIndex * 2 + 1];
      const targetY = nextColumn.centers[matchIndex];

      if (typeof topYPosition !== "number" || typeof bottomYPosition !== "number" || typeof targetY !== "number") {
        continue;
      }

      connectors.push(
        renderBracketPairConnector(
          currentColumn.x + boxWidth,
          topYPosition,
          bottomYPosition,
          nextColumn.x,
          targetY,
        ),
      );
    }
  }

  return \`
    <section class="summary-sheet summary-sheet-bracket">
      <div class="summary-bracket-wrap">
        <svg viewBox="0 0 \${viewBoxWidth} \${viewBoxHeight}" class="summary-bracket-svg" xmlns="http://www.w3.org/2000/svg" aria-label="Bracket summary page \${pageNumber}">
          <g class="bracket-labels">\${labels.join("")}</g>
          <g class="bracket-connectors">\${connectors.join("")}</g>
          <g class="bracket-boxes">\${boxes.join("")}</g>
        </svg>
      </div>
    </section>
  \`;
}

function buildBracketSummary`;

source = source.replace(/function buildBracketPage[\s\S]*?function buildBracketSummary/, pageReplacement);
fs.writeFileSync(filePath, source, "utf8");
