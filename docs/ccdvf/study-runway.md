# Study Runway

Day-by-day CCDV-F study plan: the Gantt chart, the domain legend, and every
day's topics broken down into sub-concepts with a complexity score and a time
budget. Click a day below to expand it, or
<a href="../assets/study-runway.html" target="_blank" rel="noopener">open the page by itself ↗</a> for more room.

<iframe id="sr-frame" src="../assets/study-runway.html" title="CCDV-F Study Runway"
        style="width:100%;border:1px solid var(--md-default-fg-color--lightest, #ddd);border-radius:8px;display:block;"
        loading="lazy"></iframe>

<script>
(function () {
  var frame = document.getElementById('sr-frame');
  function resize() {
    try {
      var doc = frame.contentDocument || frame.contentWindow.document;
      var h = doc.documentElement.scrollHeight;
      if (h) frame.style.height = h + 'px';
    } catch (e) { /* cross-origin — shouldn't happen when served from the same site */ }
  }
  frame.addEventListener('load', function () {
    resize();
    setTimeout(resize, 400); // let web fonts / late layout settle
    try {
      var doc = frame.contentDocument || frame.contentWindow.document;
      new MutationObserver(resize).observe(doc.body, { childList: true, subtree: true, attributes: true });
      frame.contentWindow.addEventListener('resize', resize);
    } catch (e) {}
  });
  window.addEventListener('resize', resize);
})();
</script>

## Exam PDF Viewer

Review the official CCDV-F exam guide directly here.

### Exam Guide

<p>
  <a href="../../certification/claude_certified_developer-foundation/syllabus/Claude+Certified+Developer+–+Foundations+Exam+Guide.pdf" target="_blank" rel="noopener">Open in new tab ↗</a>
</p>
<iframe
  src="../../certification/claude_certified_developer-foundation/syllabus/Claude+Certified+Developer+–+Foundations+Exam+Guide.pdf"
  title="CCDV-F Exam Guide PDF"
  style="width:100%;height:900px;border:1px solid var(--md-default-fg-color--lightest, #ddd);border-radius:8px;"
  loading="lazy"></iframe>
