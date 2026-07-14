// Main Page Mapper - 메인 페이지 동적 컨텐츠 매핑
var MainMapper = {
  map: function(data) {
    if (!data || !data.property) return;

    // Con0: 메인 히어로 슬라이더 매핑
    this.mapHeroSlides(data);

    // Con1: 숙소 영문명 + 외관 이미지 매핑
    this.mapCon1Section(data);

    // Con2: About 섹션 (타이틀 + 태그)
    this.mapAboutSection(data);

    // Con5: Closing 섹션 매핑
    this.mapClosingSection(data);
  },

  // CON0: 메인 히어로 슬라이드 매핑
  mapHeroSlides: function(data) {
    var sections = data.homepage &&
                   data.homepage.customFields &&
                   data.homepage.customFields.pages &&
                   data.homepage.customFields.pages.main &&
                   data.homepage.customFields.pages.main.sections;

    if (!sections || !sections[0]) return;

    var hero = sections[0].hero;
    var wrapper = document.querySelector('.con0 .swiper-wrapper');
    if (!wrapper) return;

    // 기존 슬라이드 제거
    wrapper.innerHTML = '';

    // isSelected가 true인 이미지만 슬라이드로 생성
    var hasSelectedImages = false;
    if (hero.images) {
      hero.images.forEach(function(img) {
        if (img.isSelected) {
          hasSelectedImages = true;
          var slide = document.createElement('div');
          slide.className = 'swiper-slide';

          var imgDiv = document.createElement('div');
          imgDiv.className = 'img';

          if (img.url) {
            imgDiv.style.backgroundImage = 'url(' + img.url + ')';
            imgDiv.style.backgroundRepeat = 'no-repeat';
            imgDiv.style.backgroundPosition = 'center';
          } else {
            ImageHelpers.applyBackgroundPlaceholder(imgDiv);
          }

          slide.appendChild(imgDiv);
          wrapper.appendChild(slide);
        }
      });
    }

    // 선택된 이미지가 없으면 placeholder 슬라이드 생성
    if (!hasSelectedImages) {
      var slide = document.createElement('div');
      slide.className = 'swiper-slide';

      var imgDiv = document.createElement('div');
      imgDiv.className = 'img';
      ImageHelpers.applyBackgroundPlaceholder(imgDiv);

      slide.appendChild(imgDiv);
      wrapper.appendChild(slide);
    }
  },

  // CON1: 핵심메시지 (index의 signature 블록을 그대로 사용: title + images[isSelected])
  mapCon1Section: function(data) {
    var sections = data.homepage &&
                   data.homepage.customFields &&
                   data.homepage.customFields.pages &&
                   data.homepage.customFields.pages.index &&
                   data.homepage.customFields.pages.index.sections;

    var signature = sections && sections[0] && sections[0].signature;

    // 타이틀 매핑 (signature.title → .con1 .tx.travelFont)
    var titleEl = document.querySelector('.con1 .tx.travelFont');
    if (titleEl && signature && signature.title) {
      titleEl.textContent = signature.title;
    }

    // 이미지 매핑 (signature.images[isSelected].url → .con1 .img img)
    var imgEl = document.querySelector('.con1 .img img');
    if (imgEl) {
      var images = (signature && signature.images) || [];
      if (images.length > 0) {
        var selectedImg = images.find(function(img) { return img.isSelected; });
        var imageUrl = (selectedImg && selectedImg.url) || (images[0] && images[0].url);
        if (imageUrl) {
          imgEl.src = imageUrl;
        } else {
          ImageHelpers.applyPlaceholder(imgEl);
        }
      } else {
        ImageHelpers.applyPlaceholder(imgEl);
      }
    }
  },

  // CON2: About 섹션 (타이틀 + 태그 + 갤러리) - 동적 생성
  mapAboutSection: function(data) {
    var sections = data.homepage &&
                   data.homepage.customFields &&
                   data.homepage.customFields.pages &&
                   data.homepage.customFields.pages.main &&
                   data.homepage.customFields.pages.main.sections;

    if (!sections || !sections[0] || !sections[0].about) return;

    var aboutArray = sections[0].about;
    // 태그 소스: 백오피스가 about 이미지 description은 안 보내고 hero 이미지 description만 보내므로,
    // index con2와 동일하게 hero.images description을 태그로 사용한다.
    var heroImages = (sections[0].hero && sections[0].hero.images) || [];
    var con2Template = document.querySelector('.con2');
    if (!con2Template) return;

    var container = con2Template.parentElement;
    var templateHtml = con2Template.outerHTML;
    var con5 = document.querySelector('.con5');  // con5 위치 저장

    // 기존 동적 con2들 모두 제거 (data-con2-dynamic 속성이 있는 것들)
    var existingCon2s = container.querySelectorAll('.con2[data-con2-dynamic]');
    existingCon2s.forEach(function(el) { el.remove(); });

    // 템플릿 con2도 제거 (data-con2-dynamic 속성이 없는 원본)
    if (!con2Template.hasAttribute('data-con2-dynamic')) {
      con2Template.remove();
    }

    // About 배열을 반복하면서 con2 동적 생성
    aboutArray.forEach(function(aboutItem) {
      // 템플릿 복제
      var con2Clone = document.createElement('div');
      con2Clone.innerHTML = templateHtml;
      var con2 = con2Clone.firstElementChild;

      // 동적으로 생성된 con2 표시 (추후 제거할 때 사용)
      con2.setAttribute('data-con2-dynamic', 'true');

      // con5 앞에 삽입 (con2가 con5보다 위에 올 수 있도록)
      if (con5) {
        container.insertBefore(con2, con5);
      } else {
        container.appendChild(con2);
      }

      // 타이틀 매핑
      var titleEl = con2.querySelector('.title');
      if (titleEl && aboutItem.title) {
        titleEl.textContent = aboutItem.title;
      }

      // 태그 매핑 (hero.images[] description - 최대 3개, index con2와 동일 소스)
      var subTitle = con2.querySelector('.subTitle');
      if (subTitle) {
        subTitle.innerHTML = '';

        // description 1개라도 입력되었는지 확인
        var hasDescription = heroImages.some(function(img) { return img && img.description; });

        if (hasDescription) {
          // 입력된 태그만 표시 (배열 전체 순회, 최대 3개까지 - index-mapper와 동일 로직)
          var tagCount = 0;
          heroImages.forEach(function(img) {
            if (tagCount < 3 && img && img.description) {
              var tag = document.createElement('div');
              tag.className = 'tag';
              tag.textContent = '#' + img.description;
              subTitle.appendChild(tag);
              tagCount++;
            }
          });
        } else {
          // Fallback: #이미지설명 3개 표시
          for (var i = 0; i < 3; i++) {
            var tag = document.createElement('div');
            tag.className = 'tag';
            tag.textContent = '#이미지설명';
            subTitle.appendChild(tag);
          }
        }
      }

      // 이미지 rolling 매핑
      var imgRolling = con2.querySelector('.imgRolling');
      if (imgRolling) {
        imgRolling.innerHTML = '';
        var hasAnyImage = false;

        if (aboutItem.images && aboutItem.images.length) {
          aboutItem.images.forEach(function(img) {
            if (img.url) {
              hasAnyImage = true;
              var imgDiv = document.createElement('div');
              imgDiv.className = 'img';
              imgDiv.style.backgroundImage = 'url(' + img.url + ')';
              imgDiv.style.backgroundSize = 'cover';
              imgDiv.style.backgroundPosition = 'center';
              imgRolling.appendChild(imgDiv);
            } else {
              var imgDiv = document.createElement('div');
              imgDiv.className = 'img';
              ImageHelpers.applyBackgroundPlaceholder(imgDiv);
              imgRolling.appendChild(imgDiv);
            }
          });
        }

        // 이미지가 없으면 placeholder 4개 추가
        if (!hasAnyImage) {
          for (var i = 0; i < 4; i++) {
            var placeholderDiv = document.createElement('div');
            placeholderDiv.className = 'img';
            ImageHelpers.applyBackgroundPlaceholder(placeholderDiv);
            imgRolling.appendChild(placeholderDiv);
          }
        }
      }
    });

    // 동적 생성된 con2의 imgRolling 초기화
    this.initializeRolling();
  },

  // ImgRolling 초기화 함수
  initializeRolling: function() {
    var con2List = document.querySelectorAll('.con2 .imgRolling');

    con2List.forEach(function(container) {
      // 이미지 복제
      var images = container.querySelectorAll('.img');
      images.forEach(function(img) {
        var clone = img.cloneNode(true);
        container.appendChild(clone);
      });

      // 롤링 애니메이션 시작
      var position = 0;
      var speed = 0.4;
      var totalWidth = container.scrollWidth;

      function roll() {
        position -= speed;
        if (Math.abs(position) >= totalWidth / 2) {
          position = 0;
        }
        container.style.transform = 'translateX(' + position + 'px)';
        requestAnimationFrame(roll);
      }

      roll();
    });
  },

  // CON5: Closing 섹션 매핑 (index의 closing 블록을 그대로 사용: pages.index.sections[0].closing.images[isSelected])
  mapClosingSection: function(data) {
    var sections = data.homepage &&
                   data.homepage.customFields &&
                   data.homepage.customFields.pages &&
                   data.homepage.customFields.pages.index &&
                   data.homepage.customFields.pages.index.sections;

    var closing = sections && sections[0] && sections[0].closing;

    // 이미지 매핑 (closing.images[]에서 isSelected인 이미지, 없으면 첫 번째)
    var imgEl = document.querySelector('.con5 .img');
    if (imgEl) {
      var imageUrl = null;
      if (closing && closing.images && closing.images.length > 0) {
        var selectedImg = closing.images.find(function(img) { return img.isSelected; });
        if (selectedImg && selectedImg.url) {
          imageUrl = selectedImg.url;
        } else if (closing.images[0] && closing.images[0].url) {
          imageUrl = closing.images[0].url;
        }
      }

      if (imageUrl) {
        imgEl.style.backgroundImage = 'url(' + imageUrl + ')';
        imgEl.style.backgroundRepeat = 'no-repeat';
        imgEl.style.backgroundPosition = '50% center';
        imgEl.style.backgroundSize = 'cover';
        imgEl.style.backgroundColor = '';
      } else {
        imgEl.style.backgroundImage = 'url(' + ImageHelpers.EMPTY_IMAGE_SVG + ')';
        imgEl.style.backgroundRepeat = 'no-repeat';
        imgEl.style.backgroundPosition = '50% center';
        imgEl.style.backgroundSize = 'cover';
        imgEl.style.backgroundColor = '#f0f0f0';
      }
    }

    // 텍스트: 하드코딩 유지
    var txEl = document.querySelector('.con5 .tx.travelFont');
    if (txEl) {
      txEl.innerHTML = 'Enjoy<br />Fullness and rest';
    }
  }

};