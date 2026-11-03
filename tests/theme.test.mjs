import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const script=readFileSync(new URL('../web/theme.js',import.meta.url),'utf8');
function boot(saved,matches){
 const root={dataset:{},style:{}},listeners={},system={matches,addEventListener(name,fn){this.changed=fn;}};
 const context={document:{documentElement:root,querySelector:()=>null,querySelectorAll:()=>[]},localStorage:{getItem:()=>saved},matchMedia:()=>system,addEventListener:(name,fn)=>listeners[name]=fn};
 vm.runInNewContext(script,context);return {root,system,listeners};
}
test('saved explicit appearance wins over device theme before initial paint',()=>{
 for(const [saved,system] of [['light',true],['dark',false]]){const {root}=boot(saved,system);assert.equal(root.dataset.theme,saved);assert.equal(root.style.colorScheme,saved);}
});
test('System mode follows later device changes while explicit theme stays fixed',()=>{
 const following=boot('system',false);assert.equal(following.root.dataset.theme,'light');following.system.matches=true;following.system.changed();assert.equal(following.root.dataset.theme,'dark');
 const fixed=boot('light',false);fixed.system.matches=true;fixed.system.changed();assert.equal(fixed.root.dataset.theme,'light');
});
test('missing or invalid stored theme defaults to Dark and cross-tab changes update appearance',()=>{
 for(const saved of [null,'invalid']){const {root}=boot(saved,false);assert.equal(root.dataset.themePreference,'dark');assert.equal(root.dataset.theme,'dark');}
 const session=boot('dark',true);session.listeners.storage({key:'finn-theme',newValue:'light'});assert.equal(session.root.dataset.theme,'light');session.listeners.storage({key:'finn-theme',newValue:'system'});assert.equal(session.root.dataset.theme,'dark');
});
