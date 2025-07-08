// Questo file è la versione semplificata del service worker registration di CRA

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
    // [::1] è l'indirizzo IPv6 localhost
    window.location.hostname === '[::1]' ||
    // 127.0.0.0/8 sono gli indirizzi IPv4 localhost
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    // L'URL del service worker
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Il service worker non verrà registrato se la pagina ha origine diversa
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // Se siamo in localhost, controlla il service worker
        checkValidServiceWorker(swUrl, config);

        // Log per sviluppatori
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'Service worker pronto. L\'app è ora offline-capable.'
          );
        });
      } else {
        // Registrazione normale del service worker in produzione
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then(registration => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Nuovi contenuti sono disponibili; mostra un messaggio all'utente
              console.log('Nuovi contenuti disponibili; ricarica la pagina.');

              // Se è stata passata una callback, chiamala
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Contenuti sono stati precacheati per il primo caricamento offline
              console.log('Contenuti precacheati; l\'app funziona offline.');

              // Se è stata passata una callback, chiamala
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch(error => {
      console.error('Errore durante la registrazione del service worker:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Controlla se il service worker esiste ancora o se è stato cancellato
  fetch(swUrl, {
    headers: { 'Service-Worker': 'script' },
  })
    .then(response => {
      // Se il file non esiste o non è JS, forza il reload della pagina
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf('javascript') === -1)
      ) {
        // Rimuove il service worker e ricarica la pagina
        navigator.serviceWorker.ready.then(registration => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker valido trovato; lo registra
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        'Nessuna connessione internet. L\'app funziona in modalità offline.'
      );
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister();
      })
      .catch(error => {
        console.error(error.message);
      });
  }
}
