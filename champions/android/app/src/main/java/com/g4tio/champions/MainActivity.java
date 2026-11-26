package com.g4tio.champions;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;

/** Contenedor nativo de la app web Champions Hub (assets/index.html). */
public class MainActivity extends Activity {
    private WebView web;
    private View fullView;
    private WebChromeClient.CustomViewCallback fullCallback;
    private FrameLayout root;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#00031F"));
        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#00031F"));
        root.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
        setContentView(root);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);          // localStorage: favoritos, copia guardada y estadísticas
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportMultipleWindows(false);    // los enlaces target=_blank pasan por shouldOverrideUrlLoading
        s.setUserAgentString(s.getUserAgentString() + " ChampionsHubApp/1.0");

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                return openExternal(req.getUrl());
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            // Videos a pantalla completa
            @Override
            public void onShowCustomView(View view, CustomViewCallback cb) {
                if (fullView != null) { cb.onCustomViewHidden(); return; }
                fullView = view; fullCallback = cb;
                root.addView(view, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
                web.setVisibility(View.GONE);
            }
            @Override
            public void onHideCustomView() { exitFullscreen(); }
        });

        if (state != null) web.restoreState(state);
        else web.loadUrl("file:///android_asset/index.html");
    }

    /** Las páginas externas (YouTube, ESPN, UEFA, Wikipedia) se abren en el navegador o en su app. */
    private boolean openExternal(Uri uri) {
        String scheme = uri.getScheme();
        if ("file".equals(scheme)) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, uri)); } catch (ActivityNotFoundException ignored) { }
        return true;
    }

    private void exitFullscreen() {
        if (fullView == null) return;
        root.removeView(fullView);
        fullView = null;
        web.setVisibility(View.VISIBLE);
        if (fullCallback != null) fullCallback.onCustomViewHidden();
        fullCallback = null;
    }

    @Override
    public void onBackPressed() {
        if (fullView != null) { exitFullscreen(); return; }
        // La app web cierra primero el visor o la ventana abierta; si no hay ninguna, se sale
        web.evaluateJavascript("(window.__appBack&&window.__appBack())?'1':'0'", v -> {
            if (!"\"1\"".equals(v)) finish();
        });
    }

    @Override protected void onSaveInstanceState(Bundle out) { super.onSaveInstanceState(out); web.saveState(out); }
    @Override protected void onPause() { super.onPause(); web.onPause(); }
    @Override protected void onResume() { super.onResume(); web.onResume(); }
    @Override protected void onDestroy() { web.destroy(); super.onDestroy(); }
}
