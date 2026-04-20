import { mfeConfig } from './app/app.config mfe';
import { AppComponent } from './app/app.component';
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';

(async () => {
  const appRef = await createApplication(mfeConfig)
  const element = createCustomElement(AppComponent, {
    injector: appRef.injector
  })
  customElements.define('learnon-mfe', element)
})();