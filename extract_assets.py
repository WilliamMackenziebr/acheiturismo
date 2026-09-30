from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
OUT = ROOT / "public" / "images"
OUT.mkdir(parents=True, exist_ok=True)

def crop(source: str, box: tuple[int, int, int, int], name: str) -> None:
    image = Image.open(ROOT / source / "screen.png").convert("RGB")
    image.crop(box).save(OUT / name, quality=94)

crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_achei_o_turismo._screen_1", (120, 470, 648, 704), "recanto-montanhas.jpg")
crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_achei_o_turismo._screen_1", (120, 906, 352, 1207), "mantiqueira-valley.jpg")
crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_achei_o_turismo._screen_1", (368, 906, 598, 1207), "cachoeira-secreta.jpg")
crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_brazilian_tourism_16", (121, 445, 378, 686), "chale-serra.jpg")
crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_brazilian_tourism_16", (390, 445, 646, 686), "gastronomia-tipica.jpg")
crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_brazilian_tourism_16", (121, 698, 378, 938), "trilha-ecoturismo.jpg")
crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_brazilian_tourism_16", (390, 698, 646, 938), "rio-destino.jpg")
crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_brazilian_tourism_app_3", (116, 184, 651, 443), "recanto-piscina.jpg")
crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_brazilian_tourism_8", (128, 312, 640, 525), "evento-cachoeiras.jpg")
crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_brazilian_tourism_8", (128, 740, 640, 954), "evento-sabores.jpg")
crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_brazilian_tourism_14", (125, 447, 379, 684), "restaurante-sabor.jpg")
crop("high_fidelity_modern_mobile_app_ui_screen_mockup_for_brazilian_tourism_14", (390, 447, 644, 684), "cafe-serra.jpg")

logo = Image.open(ROOT / "whatsapp_image_2026_09_09_at_18.58.17_1.jpeg" / "screen.png").convert("RGBA")
logo.crop((255, 236, 1000, 1030)).save(OUT / "logo-achei.png")
