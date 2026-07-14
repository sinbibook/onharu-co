// Layout Map Page Mapper - 레이아웃 맵 페이지 동적 매핑
var LayoutMapMapper = {
  map: function(data) {
    if (!data) return;

    // MAPPER: homepage.customFields.pages.layoutMap.sections[0].hero.images[isSelected]
    this.mapHeroImage(data);

    // Room Navigation 매핑
    this.mapRoomNavigation(data);

    // MAPPER: homepage.customFields.pages.layoutMap.sections[0].about.title
    this.mapConTitle(data);

    // MAPPER: homepage.customFields.pages.layoutMap.sections[0].about.images[].description (3개까지)
    this.mapConSubtitle(data);

    // Con3: Room Preview Swiper (그대로 유지)
    this.mapRoomPreview(data);

    // MAPPER: homepage.customFields.pages.layoutMap.sections[0].about.images[0].url
    this.mapConImage(data);
  },

  // Con0: Hero 이미지 매핑 (homepage.customFields.pages.layoutMap.sections[0].hero.images[isSelected])
  mapHeroImage: function(data) {
    var slide = document.querySelector('.con0 .swiper-slide');
    if (!slide) return;

    var imgDiv = slide.querySelector('.img');
    if (!imgDiv) return;

    var layoutMap = data.homepage && data.homepage.customFields &&
                    data.homepage.customFields.pages &&
                    data.homepage.customFields.pages.layoutMap &&
                    data.homepage.customFields.pages.layoutMap.sections &&
                    data.homepage.customFields.pages.layoutMap.sections[0];

    if (layoutMap && layoutMap.hero && layoutMap.hero.images) {
      var selectedImg = layoutMap.hero.images.find(function(img) { return img.isSelected; }) || layoutMap.hero.images[0];

      if (selectedImg && selectedImg.url) {
        imgDiv.style.backgroundImage = 'url(' + selectedImg.url + ')';
        imgDiv.style.backgroundRepeat = 'no-repeat';
        imgDiv.style.backgroundPosition = 'center';
        imgDiv.style.backgroundSize = 'cover';
      } else {
        ImageHelpers.applyBackgroundPlaceholder(imgDiv);
      }
    } else {
      ImageHelpers.applyBackgroundPlaceholder(imgDiv);
    }
  },

  // Room Navigation (snb_wrap ul) - 객실명=roomtypes, status=rooms id 매칭
  mapRoomNavigation: function(data) {
    var ul = document.querySelector('[data-room-nav-list]');
    if (!ul) return;

    var cf = (data && data.homepage && data.homepage.customFields) || (data && data.customFields) || {};
    var roomtypes = cf.roomtypes || [];
    var rooms = (data && data.rooms) || [];

    // 미리보기(첫 번째 li) 제외한 나머지 li 제거
    var lis = ul.querySelectorAll('li');
    for (var i = lis.length - 1; i > 0; i--) {
      lis[i].remove();
    }

    // room 링크 추가 (roomtypes 순회, 이름 있는 active 객실만)
    roomtypes.forEach(function(rt) {
      if (!rt.name || !rt.name.trim()) return;
      var matched = rooms.find(function(r) { return r.id === rt.id; });
      if (matched && matched.status === 'inactive') return;
      var li = document.createElement('li');
      var link = document.createElement('a');
      link.href = 'room.html?room_id=' + rt.id;
      link.textContent = rt.name;

      li.appendChild(link);
      ul.appendChild(li);
    });

    // Layout-map 페이지이므로 미리보기가 항상 active
    var previewLi = ul.querySelector('li');
    if (previewLi) {
      previewLi.className = 'active';
    }
  },

  // Con3: Title 매핑 (homepage.customFields.pages.layoutMap.sections[0].about.title)
  mapConTitle: function(data) {
    var titleEl = document.querySelector('.con3 .conTitle .title');
    if (!titleEl) return;

    var layoutMap = data.homepage && data.homepage.customFields &&
                    data.homepage.customFields.pages &&
                    data.homepage.customFields.pages.layoutMap &&
                    data.homepage.customFields.pages.layoutMap.sections &&
                    data.homepage.customFields.pages.layoutMap.sections[0];

    if (layoutMap && layoutMap.about && layoutMap.about.title) {
      titleEl.textContent = layoutMap.about.title;
    }
  },

  // Con3: SubTitle (Tags) 매핑 (layoutMap.about.images[].description → # 기준으로 분리)
  mapConSubtitle: function(data) {
    var subTitleEl = document.querySelector('.con3 .conTitle .subTitle');
    if (!subTitleEl) return;

    subTitleEl.innerHTML = '';

    var layoutMap = data.homepage?.customFields?.pages?.layoutMap?.sections?.[0];
    var images = layoutMap?.about?.images || [];
    var tags = [];

    images.forEach(function(img) {
      if (img && img.description) {
        img.description.split('#').map(function(s) { return s.trim(); }).filter(Boolean).forEach(function(t) {
          tags.push(t);
        });
      }
    });

    if (tags.length) {
      tags.forEach(function(tag) {
        var tagEl = document.createElement('div');
        tagEl.className = 'tag';
        tagEl.textContent = '#' + tag;
        subTitleEl.appendChild(tagEl);
      });
    } else {
      for (var i = 0; i < 3; i++) {
        var tagEl = document.createElement('div');
        tagEl.className = 'tag';
        tagEl.textContent = '#이미지설명';
        subTitleEl.appendChild(tagEl);
      }
    }
  },

  // Con3: Room Preview Swiper (객실명/이미지=roomtypes, 설명/status=rooms id 매칭)
  mapRoomPreview: function(data) {
    var wrapper = document.querySelector('.con3 .swiper-wrapper');
    if (!wrapper) return;

    var cf = (data && data.homepage && data.homepage.customFields) || (data && data.customFields) || {};
    var roomtypes = cf.roomtypes || [];
    var rooms = (data && data.rooms) || [];

    wrapper.innerHTML = '';

    if (roomtypes.length === 0) return;

    roomtypes.forEach(function(rt) {
      if (!rt.name || !rt.name.trim()) return;

      var matched = rooms.find(function(r) { return r.id === rt.id; });
      if (matched && matched.status === 'inactive') return;

      var slide = document.createElement('div');
      slide.className = 'swiper-slide';

      var link = document.createElement('a');
      link.href = 'room.html?room_id=' + rt.id;

      var imgDiv = document.createElement('div');
      imgDiv.className = 'img';

      // roomtype_thumbnail 중 isSelected === true (sortOrder순) 첫 이미지
      var thumbs = (rt.images || []).filter(function(im) { return im.category === 'roomtype_thumbnail' && im.isSelected; });
      thumbs.sort(function(a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); });
      var thumbnailUrl = thumbs[0] && thumbs[0].url ? thumbs[0].url : null;

      if (thumbnailUrl) {
        imgDiv.style.backgroundImage = 'url(' + thumbnailUrl + ')';
        imgDiv.style.backgroundRepeat = 'no-repeat';
        imgDiv.style.backgroundPosition = 'center';
        imgDiv.style.backgroundSize = 'cover';
      } else {
        ImageHelpers.applyBackgroundPlaceholder(imgDiv);
      }

      var txDiv = document.createElement('div');
      txDiv.className = 'tx';

      var tx1 = document.createElement('div');
      tx1.className = 'tx1';
      tx1.textContent = rt.name || '';

      var tx2 = document.createElement('div');
      tx2.className = 'tx2';
      tx2.textContent = (matched && (matched.description || matched.roomInfo)) || '';

      txDiv.appendChild(tx1);
      txDiv.appendChild(tx2);

      link.appendChild(imgDiv);
      link.appendChild(txDiv);
      slide.appendChild(link);
      wrapper.appendChild(slide);
    });
  },

  // Con5: Image 매핑 (homepage.customFields.pages.layoutMap.sections[0].about.images[0].url)
  mapConImage: function(data) {
    var imgEl = document.querySelector('.con5 .img img');
    if (!imgEl) return;

    var layoutMap = data.homepage && data.homepage.customFields &&
                    data.homepage.customFields.pages &&
                    data.homepage.customFields.pages.layoutMap &&
                    data.homepage.customFields.pages.layoutMap.sections &&
                    data.homepage.customFields.pages.layoutMap.sections[0];

    if (layoutMap && layoutMap.about && layoutMap.about.images && layoutMap.about.images[0] && layoutMap.about.images[0].url) {
      imgEl.src = layoutMap.about.images[0].url;
    } else {
      ImageHelpers.applyPlaceholder(imgEl);
    }
  }

};