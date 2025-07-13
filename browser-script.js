(async () => {
    // ---------- helper utilities ----------
    const sleep = ms => new Promise(res => setTimeout(res, ms));
    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  
    const scrollToBottom = async () => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      // give lazy content time to load
      await sleep(rand(2000, 3000));
    };
  
    const clickIfExists = async (selectorOrFilterFn) => {
      let el =
        typeof selectorOrFilterFn === 'string'
          ? document.querySelector(selectorOrFilterFn)
          : [...document.querySelectorAll('button')].find(selectorOrFilterFn);
  
      if (el) {
        el.click();
        return true;
      }
      return false;
    };
  
    // ---------- Phase 1: endless scroll ----------
    while (true) {
      await scrollToBottom();
  
      // “Show more results” sometimes has slight text variants; use includes()
      const clicked = await clickIfExists(btn =>
        btn.innerText.trim().toLowerCase().startsWith('show more result')
      );
  
      if (!clicked) break; // button no longer on page → move on
    }
  
    // ---------- Phase 2: collect & click “Connect” buttons ----------
    const collectConnectButtons = () =>
      [...document.querySelectorAll('button')]
        .filter(
          b =>
            b.innerText.trim() === 'Connect' && // strict match
            !b.disabled &&
            b.offsetParent !== null // visible
        );
  
    let connectBtns = collectConnectButtons();
    let sent = 0;
  
    while (connectBtns.length) {
      const btn = connectBtns.shift();
      btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
      await sleep(rand(800, 1500)); // small pause before click
      btn.click();
  
      // ---------- Phase 3: handle invite modal ----------
      // wait for modal to mount
      await sleep(rand(1200, 2000));
      const sentBtnClicked = await clickIfExists(
        b => b.innerText.trim() === 'Send without a note'
      );
      if (!sentBtnClicked) {
        // fallback: close modal if something went wrong
        clickIfExists('button.artdeco-modal__dismiss');
      } else {
        sent++;
      }
  
      await sleep(rand(2000, 4000)); // polite interval before next connect
      connectBtns = collectConnectButtons(); // refresh list (some new ones may have appeared)
    }
  
    console.log(`🎉 Finished! Invitations sent: ${sent}`);
  })();
  