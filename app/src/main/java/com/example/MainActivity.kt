package com.example

import android.annotation.SuppressLint
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat

class MainActivity : ComponentActivity() {

  private var webView: WebView? = null
  private var filePathCallback: ValueCallback<Array<Uri>>? = null

  private val filePickerLauncher =
    registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
      if (result.resultCode == Activity.RESULT_OK) {
        val data = result.data
        val clipData = data?.clipData
        val results =
          when {
            clipData != null -> {
              Array(clipData.itemCount) { i -> clipData.getItemAt(i).uri }
            }
            data?.data != null -> {
              arrayOf(data.data!!)
            }
            else -> null
          }
        filePathCallback?.onReceiveValue(results)
      } else {
        filePathCallback?.onReceiveValue(null)
      }
      filePathCallback = null
    }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()

    // Keep screen on for TV ambient frame display
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

    // Hide system bars for immersive 16:9 full-screen experience
    val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
    windowInsetsController.systemBarsBehavior =
      WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    windowInsetsController.hide(WindowInsetsCompat.Type.systemBars())

    setContent {
      SlideshowScreen(
        onWebViewCreated = { view -> webView = view },
        onOpenFileChooser = { callback, intent ->
          filePathCallback = callback
          filePickerLauncher.launch(intent)
        }
      )
    }
  }

  override fun dispatchKeyEvent(event: KeyEvent): Boolean {
    if (event.action == KeyEvent.ACTION_DOWN) {
      when (event.keyCode) {
        KeyEvent.KEYCODE_DPAD_CENTER,
        KeyEvent.KEYCODE_ENTER,
        KeyEvent.KEYCODE_BUTTON_A -> {
          webView?.evaluateJavascript("window.app?.togglePlayPause();", null)
          return true
        }
        KeyEvent.KEYCODE_DPAD_LEFT -> {
          webView?.evaluateJavascript("window.app?.prevSlide();", null)
          return true
        }
        KeyEvent.KEYCODE_DPAD_RIGHT -> {
          webView?.evaluateJavascript("window.app?.nextSlide();", null)
          return true
        }
        KeyEvent.KEYCODE_DPAD_UP -> {
          webView?.evaluateJavascript("window.app?.showUI();", null)
          return true
        }
        KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE -> {
          webView?.evaluateJavascript("window.app?.togglePlayPause();", null)
          return true
        }
        KeyEvent.KEYCODE_MEDIA_NEXT -> {
          webView?.evaluateJavascript("window.app?.nextSlide();", null)
          return true
        }
        KeyEvent.KEYCODE_MEDIA_PREVIOUS -> {
          webView?.evaluateJavascript("window.app?.prevSlide();", null)
          return true
        }
        KeyEvent.KEYCODE_BACK -> {
          // If a modal is open, close it; otherwise perform standard back
          webView?.evaluateJavascript(
            """
            (function() {
              var openModal = document.querySelector('.modal-backdrop.open');
              if (openModal) {
                window.app?.closeAllModals();
                return true;
              } else {
                window.app?.openModal(window.app?.settingsModal);
                return true;
              }
            })();
            """.trimIndent()
          ) { result ->
            if (result == "false" || result == null) {
              super.onBackPressedDispatcher.onBackPressed()
            }
          }
          return true
        }
      }
    }
    return super.dispatchKeyEvent(event)
  }

  override fun onPause() {
    super.onPause()
    webView?.evaluateJavascript("window.app?.pause();", null)
  }

  override fun onResume() {
    super.onResume()
    webView?.evaluateJavascript("window.app?.resume();", null)
  }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun SlideshowScreen(
  onWebViewCreated: (WebView) -> Unit,
  onOpenFileChooser: (ValueCallback<Array<Uri>>, Intent) -> Unit
) {
  val context = LocalContext.current

  AndroidView(
    modifier = Modifier.fillMaxSize().background(Color.Black),
    factory = { ctx ->
      WebView(ctx).apply {
        layoutParams =
          ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
          )
        setBackgroundColor(android.graphics.Color.BLACK)
        setLayerType(View.LAYER_TYPE_HARDWARE, null)

        settings.apply {
          javaScriptEnabled = true
          domStorageEnabled = true
          databaseEnabled = true
          allowFileAccess = true
          allowContentAccess = true
          mediaPlaybackRequiresUserGesture = false
          cacheMode = WebSettings.LOAD_DEFAULT
          useWideViewPort = true
          loadWithOverviewMode = true
        }

        webViewClient =
          object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
              view: WebView?,
              request: WebResourceRequest?
            ): Boolean {
              return false
            }
          }

        webChromeClient =
          object : WebChromeClient() {
            override fun onShowFileChooser(
              view: WebView?,
              filePathCallback: ValueCallback<Array<Uri>>?,
              fileChooserParams: FileChooserParams?
            ): Boolean {
              if (filePathCallback == null) return false
              val intent =
                fileChooserParams?.createIntent()
                  ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    putExtra(Intent.EXTRA_ALLOW_MULTIPLE, true)
                  }
              onOpenFileChooser(filePathCallback, intent)
              return true
            }
          }

        loadUrl("file:///android_asset/web/index.html")
        onWebViewCreated(this)
      }
    }
  )
}
