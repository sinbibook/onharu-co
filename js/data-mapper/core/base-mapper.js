// Base Mapper - 페이지 공통 매핑 유틸 (SEO 메타태그 등)
// 기존엔 각 페이지 매퍼에 updateMetaTags가 중복 정의돼 있었으나 이곳으로 통일.
(function (global) {
  var BaseMapper = {
    // SEO 메타태그 공통 처리: homepage.seo → title + description/keywords + 네이버/구글 사이트 인증
    updateMetaTags: function (data) {
      var seo = (data && data.homepage && data.homepage.seo) || {};

      // name 기반 meta 태그를 upsert (값 없으면 태그 생성 안 함 → 빈 태그 방지)
      function upsertMetaByName(name, content) {
        if (!content) return;
        var meta = document.head.querySelector('meta[name="' + name + '"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      }

      if (seo.title) {
        var titleEl = document.querySelector('title');
        if (titleEl) titleEl.textContent = seo.title;
      }

      upsertMetaByName('description', seo.description);
      upsertMetaByName('keywords', seo.keywords);
      upsertMetaByName('naver-site-verification', seo.naverSiteVerification);
      upsertMetaByName('google-site-verification', seo.googleSiteVerification);
    }
  };

  global.BaseMapper = BaseMapper;
})(window);
