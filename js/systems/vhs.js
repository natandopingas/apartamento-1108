// ── VHS POST-PROCESSING SHADER ──
// Scanlines + chromatic aberration + film grain + vignette + glitch

export const VHSShader = {
  uniforms: {
    tDiffuse: { value: null },
    time:     { value: 0.0 },
    tension:  { value: 0.0 }, // 0=normal, 1=full tension (intensifies effects)
  },

  vertexShader: /* glsl */`
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */`
    uniform sampler2D tDiffuse;
    uniform float time;
    uniform float tension;
    varying vec2 vUv;

    float rand(vec2 co) {
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = rand(i);
      float b = rand(i + vec2(1.0, 0.0));
      float c = rand(i + vec2(0.0, 1.0));
      float d = rand(i + vec2(1.0, 1.0));
      return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
    }

    void main() {
      vec2 uv = vUv;

      // ── GLITCH (every ~35s for 0.25s) ──
      float glitchCycle = mod(time, 35.0);
      float glitchAmt = 0.0;
      if (glitchCycle < 0.25) {
        glitchAmt = (0.25 - glitchCycle) * 4.0;
        float band = floor(uv.y * 20.0);
        float rng = rand(vec2(band, floor(time * 8.0)));
        if (rng > 0.6) {
          uv.x += (rand(vec2(uv.y, time)) - 0.5) * 0.06 * glitchAmt;
        }
      }

      // ── CHROMATIC ABERRATION ──
      float dist = length(uv - 0.5);
      float aber = (0.0018 + tension * 0.001) * dist * dist;
      float r = texture2D(tDiffuse, uv + vec2( aber, 0.0)).r;
      float g = texture2D(tDiffuse, uv               ).g;
      float b = texture2D(tDiffuse, uv + vec2(-aber, 0.0)).b;
      vec4 col = vec4(r, g, b, 1.0);

      // ── SCANLINES ──
      float scanFreq = 600.0;
      float scanSpeed = 0.8;
      float scanAmp  = 0.05 + tension * 0.02;
      float scan = 1.0 - scanAmp * (0.5 + 0.5 * sin(uv.y * scanFreq + time * scanSpeed));
      col.rgb *= scan;

      // ── FILM GRAIN ──
      float grainAmt = 0.025 + tension * 0.02;
      float grain = noise(uv * 800.0 + vec2(time * 47.3, time * 31.7)) * 2.0 - 1.0;
      col.rgb += grain * grainAmt;

      // ── VIGNETTE ──
      float vigStrength = 0.32 + tension * 0.12;
      float vig = 1.0 - smoothstep(0.45, 0.95, dist * vigStrength * 2.0);
      col.rgb *= vig;

      // ── DESATURATE ──
      float desat = 0.08 + tension * 0.06;
      float lum = dot(col.rgb, vec3(0.299, 0.587, 0.114));
      col.rgb = mix(col.rgb, vec3(lum), desat);

      // ── SLIGHT GREEN TINT (VHS) ──
      col.rgb *= vec3(0.96, 1.02, 0.96);

      gl_FragColor = clamp(col, 0.0, 1.0);
    }
  `,
};
