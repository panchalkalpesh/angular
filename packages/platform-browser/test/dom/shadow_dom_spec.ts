/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, EventEmitter, Injector, Input, NgModule, Output, Renderer2, ViewEncapsulation, destroyPlatform} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';

function supportsShadowDOMV1() {
  const testEl = document.createElement('div');
  return (typeof customElements !== 'undefined') && (typeof testEl.attachShadow !== 'undefined');
}

if (supportsShadowDOMV1()) {
  describe('ShadowDOM Support', () => {

    let testContainer: HTMLDivElement;

    beforeEach(() => { TestBed.configureTestingModule({imports: [TestModule]}); });

    it('should attach and use a shadowRoot when ViewEncapsulation.Native is set', () => {
      const compEl = TestBed.createComponent(ShadowComponent).nativeElement;
      expect(compEl.shadowRoot !.textContent).toEqual('Hello World');
    });

    it('should use the shadow root to encapsulate styles', () => {
      const compEl = TestBed.createComponent(StyledShadowComponent).nativeElement;
      expect(window.getComputedStyle(compEl).border).toEqual('1px solid rgb(0, 0, 0)');
      const redDiv = compEl.shadowRoot.querySelector('div.red');
      expect(window.getComputedStyle(redDiv).border).toEqual('1px solid rgb(255, 0, 0)');
    });

    it('should allow the usage of <slot> elements', () => {
      const el = TestBed.createComponent(ShadowSlotComponent).nativeElement;
      const projectedContent = document.createTextNode('Hello Slot!');
      el.appendChild(projectedContent);
      const slot = el.shadowRoot !.querySelector('slot');

      expect(slot !.assignedNodes().length).toBe(1);
      expect(slot !.assignedNodes()[0].textContent).toBe('Hello Slot!');
    });

    it('should allow the usage of named <slot> elements', () => {
      const el = TestBed.createComponent(ShadowSlotsComponent).nativeElement;

      const headerContent = document.createElement('h1');
      headerContent.setAttribute('slot', 'header');
      headerContent.textContent = 'Header Text!';

      const articleContent = document.createElement('span');
      articleContent.setAttribute('slot', 'article');
      articleContent.textContent = 'Article Text!';

      const articleSubcontent = document.createElement('span');
      articleSubcontent.setAttribute('slot', 'article');
      articleSubcontent.textContent = 'Article Subtext!';

      el.appendChild(headerContent);
      el.appendChild(articleContent);
      el.appendChild(articleSubcontent);

      const headerSlot = el.shadowRoot !.querySelector('slot[name=header]') as HTMLSlotElement;
      const articleSlot = el.shadowRoot !.querySelector('slot[name=article]') as HTMLSlotElement;

      expect(headerSlot !.assignedNodes().length).toBe(1);
      expect(headerSlot !.assignedNodes()[0].textContent).toBe('Header Text!');
      expect(headerContent.assignedSlot).toBe(headerSlot);

      expect(articleSlot !.assignedNodes().length).toBe(2);
      expect(articleSlot !.assignedNodes()[0].textContent).toBe('Article Text!');
      expect(articleSlot !.assignedNodes()[1].textContent).toBe('Article Subtext!');
      expect(articleContent.assignedSlot).toBe(articleSlot);
      expect(articleSubcontent.assignedSlot).toBe(articleSlot);
    });
  });
}

@Component(
    {selector: 'shadow-comp', template: 'Hello World', encapsulation: ViewEncapsulation.ShadowDom})
class ShadowComponent {
}

@Component({
  selector: 'styled-shadow-comp',
  template: '<div class="red"></div>',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [`:host { border: 1px solid black; } .red { border: 1px solid red; }`]
})
class StyledShadowComponent {
}

@Component({
  selector: 'shadow-slot-comp',
  template: '<slot></slot>',
  encapsulation: ViewEncapsulation.ShadowDom
})
class ShadowSlotComponent {
}

@Component({
  selector: 'shadow-slots-comp',
  template:
      '<header><slot name="header"></slot></header><article><slot name="article"></slot></article>',
  encapsulation: ViewEncapsulation.ShadowDom
})
class ShadowSlotsComponent {
}

@NgModule({
  imports: [BrowserModule],
  declarations: [ShadowComponent, ShadowSlotComponent, ShadowSlotsComponent, StyledShadowComponent],
  entryComponents:
      [ShadowComponent, ShadowSlotComponent, ShadowSlotsComponent, StyledShadowComponent],
})
class TestModule {
  ngDoBootstrap() {}
}
