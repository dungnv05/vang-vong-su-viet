import sys
import os

try:
    import bpy
except ImportError:
    print("Script này cần môi trường Blender Python (bpy). Bạn hãy chạy câu lệnh:")
    print("  blender --background --python scripts/generate_hero_blender.py")
    sys.exit(0)

def create_thanh_giong_model(output_filepath):
    # 1. Xóa toàn bộ vật thể mặc định trong Scene
    bpy.ops.wm.read_factory_settings(use_empty=True)
    
    # 2. Tạo Thân Nhân Vật (Torso)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.3, depth=1.0, location=(0, 0, 1.0))
    torso = bpy.context.active_object
    torso.name = "ThanhGiong_Torso"

    # Tạo Material Giáp Vàng Hoàng Gia
    mat_gold = bpy.data.materials.new(name="Mat_Gold_Armor")
    mat_gold.use_nodes = True
    bsdf = mat_gold.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs['Base Color'].default_value = (0.9, 0.7, 0.1, 1.0) # Màu vàng hoàng gia
        bsdf.inputs['Metallic'].default_value = 0.9
        bsdf.inputs['Roughness'].default_value = 0.2
    torso.data.materials.append(mat_gold)

    # 3. Tạo Đầu & Mũ Giáp (Head)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, location=(0, 0, 1.8))
    head = bpy.context.active_object
    head.name = "ThanhGiong_Head"
    head.data.materials.append(mat_gold)

    # 4. Tạo Áo Bào Đỏ (Cape)
    bpy.ops.mesh.primitive_plane_add(size=1.2, location=(0, 0.4, 1.2))
    cape = bpy.context.active_object
    cape.name = "ThanhGiong_Cape"
    cape.rotation_euler = (0.5, 0, 0)
    
    mat_red = bpy.data.materials.new(name="Mat_Red_Cape")
    mat_red.use_nodes = True
    bsdf_red = mat_red.node_tree.nodes.get("Principled BSDF")
    if bsdf_red:
        bsdf_red.inputs['Base Color'].default_value = (0.9, 0.1, 0.1, 1.0)
    cape.data.materials.append(mat_red)

    # 5. Tạo Gậy Tre Ngà Rực Lửa (Flaming Bamboo Staff)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.08, depth=2.4, location=(0.8, 0, 1.4))
    bamboo = bpy.context.active_object
    bamboo.name = "Flaming_Bamboo_Staff"
    bamboo.rotation_euler = (0, 0.3, -0.3)

    mat_bamboo = bpy.data.materials.new(name="Mat_Bamboo_Flame")
    mat_bamboo.use_nodes = True
    bsdf_bamboo = mat_bamboo.node_tree.nodes.get("Principled BSDF")
    if bsdf_bamboo:
        bsdf_bamboo.inputs['Base Color'].default_value = (0.1, 0.8, 0.4, 1.0) # Màu xanh ngọc tre
        if 'Emission Color' in bsdf_bamboo.inputs:
            bsdf_bamboo.inputs['Emission Color'].default_value = (1.0, 0.4, 0.0, 1.0)
            bsdf_bamboo.inputs['Emission Strength'].default_value = 3.0
    bamboo.data.materials.append(mat_bamboo)

    # 6. Tạo Ngựa Sắt Binh (Iron Warhorse)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.4))
    horse = bpy.context.active_object
    horse.name = "Iron_Warhorse"
    horse.scale = (0.8, 1.6, 0.7)
    horse.data.materials.append(mat_gold)

    # 7. Xuất ra file .glb
    os.makedirs(os.path.dirname(output_filepath), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=output_filepath,
        export_format='GLB',
        export_apply=True
    )
    print(f"[Blender Script] Đã xuất thành công Model .glb vào: {output_filepath}")

if __name__ == "__main__":
    output_path = os.path.abspath("public/models/thanh_giong.glb")
    create_thanh_giong_model(output_path)
