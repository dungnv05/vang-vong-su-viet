"""
Script Blender Python: Tạo Mô Hình 3D Bà Triệu - Nữ Tướng Cưỡi Voi Trắng
Chạy bằng lệnh:
  /Applications/Blender.app/Contents/MacOS/Blender --background --python scripts/generate_ba_trieu_blender.py
"""

import bpy
import bmesh
import bpy
import bmesh
import math
import os
import sys

def clear_scene():
    """Xóa toàn bộ scene mặc định"""
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    for col in bpy.data.collections:
        bpy.data.collections.remove(col)

def create_material(name, color, metallic=0.0, roughness=0.5, emissive=None, emissive_strength=0.0):
    """Tạo Material PBR chuẩn"""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    output = nodes.new('ShaderNodeOutputMaterial')
    bsdf = nodes.new('ShaderNodeBsdfPrincipled')
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

    bsdf.inputs['Base Color'].default_value = (*color, 1.0)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness

    if emissive:
        bsdf.inputs['Emission Color'].default_value = (*emissive, 1.0)
        bsdf.inputs['Emission Strength'].default_value = emissive_strength

    return mat

def add_obj(obj, collection=None):
    """Đảm bảo object vào scene collection"""
    if collection:
        collection.objects.link(obj)
    else:
        bpy.context.scene.collection.objects.link(obj)

# ─────────────────────────────────────────────────────────────
# 1. VOI TRẮNG CHIẾN (White War Elephant)
# ─────────────────────────────────────────────────────────────
def create_elephant():
    mat_white = create_material("ElephantSkin", (0.92, 0.92, 0.90), roughness=0.8)
    mat_gold  = create_material("ElephantArmor", (0.85, 0.65, 0.10), metallic=0.95, roughness=0.1)
    mat_ruby  = create_material("Ruby", (0.85, 0.05, 0.05), metallic=0.3, roughness=0.2,
                                emissive=(1.0, 0.1, 0.1), emissive_strength=1.5)
    mat_sapphire = create_material("Sapphire", (0.05, 0.15, 0.85), metallic=0.3, roughness=0.2,
                                   emissive=(0.1, 0.3, 1.0), emissive_strength=1.5)

    group = bpy.data.objects.new("Elephant_Group", None)
    bpy.context.scene.collection.objects.link(group)

    def make_mesh(name, verts, faces, material):
        mesh = bpy.data.meshes.new(name)
        obj  = bpy.data.objects.new(name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        mesh.from_pydata(verts, [], faces)
        mesh.update()
        obj.data.materials.append(material)
        obj.parent = group
        return obj

    # Thân Voi (ellipsoid bằng cube + subdivision)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
    body = bpy.context.active_object
    body.name = "Elephant_Body"
    body.scale = (1.6, 2.8, 1.3)
    body.data.materials.append(mat_white)
    body.parent = group

    # Modifier Subdivision để bo tròn
    subsurf = body.modifiers.new("Subdiv", 'SUBSURF')
    subsurf.levels = 2

    # Đầu Voi
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, location=(0, -2.2, 0.3))
    head = bpy.context.active_object
    head.name = "Elephant_Head"
    head.scale = (0.95, 1.1, 0.9)
    head.data.materials.append(mat_white)
    head.parent = group

    # Vòi Voi (Trunk) - chuỗi cylinder nối nhau
    trunk_segments = [
        ((0, -3.1, 0.0), (0.28, 0.28, 0.45), (-0.15, 0, 0)),
        ((0, -3.5, -0.5), (0.24, 0.24, 0.5), (-0.3, 0, 0)),
        ((0.1, -3.7, -1.0), (0.20, 0.20, 0.45), (-0.2, 0, 0.1)),
        ((0.25, -3.6, -1.5), (0.17, 0.17, 0.40), (0.0, 0, 0.2)),
    ]
    for i, (loc, sc, rot) in enumerate(trunk_segments):
        bpy.ops.mesh.primitive_cylinder_add(radius=1, depth=1, location=loc)
        t = bpy.context.active_object
        t.name = f"Trunk_{i}"
        t.scale = sc
        t.rotation_euler = rot
        t.data.materials.append(mat_white)
        t.parent = group

    # Ngà Voi (Tusks)
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_cone_add(radius1=0.12, radius2=0.02, depth=1.2,
                                        location=(side * 0.55, -3.15, -0.55))
        tusk = bpy.context.active_object
        tusk.name = f"Tusk_{'L' if side < 0 else 'R'}"
        tusk.rotation_euler = (0.5, 0, side * 0.25)
        ivory = create_material("Ivory", (0.95, 0.90, 0.75), roughness=0.25)
        tusk.data.materials.append(ivory)
        tusk.parent = group

    # Tai Voi (Ears)
    for side in [-1, 1]:
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.75, location=(side * 1.3, -2.0, 0.2))
        ear = bpy.context.active_object
        ear.name = f"Ear_{'L' if side < 0 else 'R'}"
        ear.scale = (0.25, 0.6, 0.9)
        ear.data.materials.append(mat_white)
        ear.parent = group

    # 4 Chân Voi
    leg_positions = [(-0.95, -1.3), (0.95, -1.3), (-0.95, 1.2), (0.95, 1.2)]
    for i, (lx, ly) in enumerate(leg_positions):
        bpy.ops.mesh.primitive_cylinder_add(radius=0.38, depth=1.8, location=(lx, ly, -1.65))
        leg = bpy.context.active_object
        leg.name = f"Leg_{i}"
        leg.data.materials.append(mat_white)
        leg.parent = group

    # Đuôi Voi
    bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=1.0, location=(0, 2.8, 0.3))
    tail = bpy.context.active_object
    tail.name = "Tail"
    tail.rotation_euler = (0.4, 0, 0)
    tail.data.materials.append(mat_white)
    tail.parent = group

    # ─── Giáp Vàng Trang Trí Voi (Gold Armor Plates) ───
    # Yên Voi (Saddle)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.4))
    saddle = bpy.context.active_object
    saddle.name = "Elephant_Saddle"
    saddle.scale = (1.3, 1.1, 0.35)
    saddle.data.materials.append(mat_gold)
    saddle.parent = group

    # Tấm Giáp Trán Voi
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -2.8, 0.5))
    headplate = bpy.context.active_object
    headplate.name = "HeadArmor"
    headplate.scale = (0.85, 0.2, 0.75)
    headplate.data.materials.append(mat_gold)
    headplate.parent = group

    # Hoa văn xoắn ốc Đồng Sơn trên yên (Decorative Swirls - simplified as tori)
    for angle in [0, math.pi/2, math.pi, 3*math.pi/2]:
        bpy.ops.mesh.primitive_torus_add(
            major_radius=0.22, minor_radius=0.05,
            location=(math.cos(angle)*0.55, math.sin(angle)*0.35, 1.78))
        swirl = bpy.context.active_object
        swirl.name = f"Swirl_{angle:.2f}"
        swirl.scale = (1, 1, 0.4)
        swirl.data.materials.append(mat_gold)
        swirl.parent = group

    # Đá Quý trên giáp (Gems)
    gem_positions = [(-0.5, 0, 1.8), (0.5, 0, 1.8), (0, -2.8, 0.9), (0, 0, 1.85)]
    gem_mats = [mat_ruby, mat_sapphire, mat_ruby, mat_sapphire]
    for i, (gpos, gmat) in enumerate(zip(gem_positions, gem_mats)):
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.09, location=gpos)
        gem = bpy.context.active_object
        gem.name = f"Gem_{i}"
        gem.data.materials.append(gmat)
        gem.parent = group

    return group

# ─────────────────────────────────────────────────────────────
# 2. BÀ TRIỆU - NỮ TƯỚNG CÀI GIÁP VÀNG (Seamless Voxel Body)
# ─────────────────────────────────────────────────────────────
def create_ba_trieu():
    mat_skin   = create_material("Skin",      (0.87, 0.68, 0.52), roughness=0.7)
    mat_gold   = create_material("GoldArmor", (0.90, 0.68, 0.10), metallic=0.95, roughness=0.08)
    mat_yellow = create_material("YellowRobe", (0.92, 0.72, 0.02), roughness=0.6)
    mat_black  = create_material("BlackHair", (0.05, 0.04, 0.06), roughness=0.4)
    mat_blade  = create_material("SwordBlade", (0.88, 0.88, 0.92), metallic=1.0, roughness=0.05,
                                 emissive=(0.6, 0.7, 1.0), emissive_strength=0.8)
    mat_ruby   = create_material("HeroRuby",  (0.9, 0.05, 0.05), metallic=0.3, roughness=0.2,
                                 emissive=(1.0, 0.1, 0.1), emissive_strength=2.0)

    group = bpy.data.objects.new("BaTrieu_Group", None)
    bpy.context.scene.collection.objects.link(group)
    group.location = (0, -0.4, 2.0)  # Ngồi trên lưng voi

    # --- DỰNG KHUNG HÌNH HỌC HỮU CƠ (Organic Primitive Skeleton) ---
    body_parts = []
    
    # Đầu (Head)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.35, location=(0, -0.2, 3.2))
    head = bpy.context.active_object
    head.scale = (1, 0.85, 1.1)
    body_parts.append(head)
    
    # Cổ (Neck)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.15, depth=0.35, location=(0, -0.15, 2.85))
    body_parts.append(bpy.context.active_object)
    
    # Ngực (Upper Torso)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.45, location=(0, -0.1, 2.5))
    chest = bpy.context.active_object
    chest.scale = (1, 0.7, 0.9)
    body_parts.append(chest)
    
    # Eo (Waist)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.35, depth=0.5, location=(0, -0.1, 2.1))
    body_parts.append(bpy.context.active_object)
    
    # Hông (Hips)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.48, location=(0, -0.05, 1.8))
    hips = bpy.context.active_object
    hips.scale = (1.1, 0.8, 0.9)
    body_parts.append(hips)
    
    # Đùi (Thighs) - Tách háng
    bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=0.7, location=(-0.25, 0.1, 1.4))
    thigh_L = bpy.context.active_object
    thigh_L.rotation_euler = (0.5, 0, 0.2)
    body_parts.append(thigh_L)
    
    bpy.ops.mesh.primitive_cylinder_add(radius=0.22, depth=0.7, location=(0.25, 0.1, 1.4))
    thigh_R = bpy.context.active_object
    thigh_R.rotation_euler = (0.5, 0, -0.2)
    body_parts.append(thigh_R)
    
    # Vai (Shoulders)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(-0.5, -0.1, 2.6))
    body_parts.append(bpy.context.active_object)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.18, location=(0.5, -0.1, 2.6))
    body_parts.append(bpy.context.active_object)
    
    # Bắp tay (Upper Arms)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.13, depth=0.6, location=(-0.6, -0.1, 2.3))
    arm_L = bpy.context.active_object
    arm_L.rotation_euler = (0, 0.2, 0)
    body_parts.append(arm_L)
    
    bpy.ops.mesh.primitive_cylinder_add(radius=0.13, depth=0.6, location=(0.6, -0.1, 2.3))
    arm_R = bpy.context.active_object
    arm_R.rotation_euler = (0, -0.2, 0)
    body_parts.append(arm_R)
    
    # Hợp nhất tất cả các khối thành 1 Object
    bpy.ops.object.select_all(action='DESELECT')
    for p in body_parts:
        p.select_set(True)
    bpy.context.view_layer.objects.active = body_parts[0]
    bpy.ops.object.join()
    body_mesh = bpy.context.active_object
    body_mesh.name = "BaTrieu_Body"
    
    # --- ÁP DỤNG VOXEL REMESH ĐỂ TẠO LƯỚI LIỀN MẠCH ---
    remesh = body_mesh.modifiers.new(name="Remesh", type='REMESH')
    remesh.mode = 'VOXEL'
    remesh.voxel_size = 0.05
    remesh.use_smooth_shade = True
    
    # Áp dụng Smooth modifier để làm mịn hữu cơ
    smooth = body_mesh.modifiers.new(name="Smooth", type='CORRECTIVE_SMOOTH')
    smooth.factor = 0.8
    smooth.iterations = 10
    
    bpy.ops.object.modifier_apply(modifier="Remesh")
    bpy.ops.object.modifier_apply(modifier="Smooth")
    
    # Cập nhật vật liệu
    body_mesh.data.materials.append(mat_skin)
    body_mesh.parent = group


    # ─── MŨ CHIẾN TƯỚNG (War Helmet) ───
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.38, location=(0, -0.2, 3.4))
    helmet = bpy.context.active_object
    helmet.name = "Helmet"
    helmet.scale = (1.0, 0.95, 0.75)
    helmet.data.materials.append(mat_gold)
    helmet.parent = group

    # Đỉnh mũ nhọn
    bpy.ops.mesh.primitive_cone_add(radius1=0.08, radius2=0.02, depth=0.4, location=(0, -0.2, 3.75))
    crest = bpy.context.active_object
    crest.name = "HelmetCrest"
    crest.data.materials.append(mat_gold)
    crest.parent = group

    # Đá quý trán mũ
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.06, location=(0, -0.58, 3.4))
    helmet_gem = bpy.context.active_object
    helmet_gem.name = "HelmetGem"
    helmet_gem.data.materials.append(mat_ruby)
    helmet_gem.parent = group

    # ─── TÓC DÀI BAY (Long Flowing Hair) ───
    hair_strands = [
        # (loc, scale, rot_euler)
        ((0.28, 0.35, 3.2), (0.12, 0.08, 1.0),  (0.3, -0.2, 0.5)),
        ((-0.3, 0.38, 3.1), (0.11, 0.07, 1.1),   (0.25, 0.2, -0.4)),
        ((0.5, 0.5, 2.8),    (0.09, 0.07, 1.4),   (0.5, -0.3, 0.8)),
        ((-0.55, 0.48, 2.7), (0.09, 0.07, 1.3),   (0.45, 0.25, -0.7)),
        ((0.25, 0.55, 2.4),  (0.08, 0.06, 1.2),   (0.6, -0.1, 0.4)),
        ((-0.2, 0.58, 2.3),  (0.08, 0.06, 1.15),  (0.65, 0.1, -0.3)),
        ((0.0, 0.6, 3.0),    (0.14, 0.09, 1.6),   (0.35, 0, 0)),
    ]
    for i, (loc, sc, rot) in enumerate(hair_strands):
        bpy.ops.mesh.primitive_cylinder_add(radius=1, depth=2, location=loc)
        strand = bpy.context.active_object
        strand.name = f"Hair_{i}"
        strand.scale = sc
        strand.rotation_euler = rot
        strand.data.materials.append(mat_black)
        strand.parent = group

    # Viền giáp ngực (Collar)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.35, minor_radius=0.06, location=(0, -0.1, 2.6))
    collar = bpy.context.active_object
    collar.name = "ArmorCollar"
    collar.scale = (1, 0.55, 0.5)
    collar.data.materials.append(mat_gold)
    collar.parent = group

    # Thân dưới / Váy Áo Bào vàng
    bpy.ops.mesh.primitive_cone_add(radius1=0.7, radius2=0.45, depth=1.1, location=(0, 0, 1.15))
    skirt = bpy.context.active_object
    skirt.name = "Skirt"
    skirt.data.materials.append(mat_yellow)
    skirt.parent = group

    # ─── CÁNH TAY & GIÁP TRANG (Arms & Armor) ───
    arm_data = [
        # side, upper_loc, upper_rot, lower_loc, lower_rot
        ( 1, (0.68, -0.1, 2.1),  (0.2, 0, -0.5),  (0.95, -0.25, 1.75), (0.4, 0, -0.3)),
        (-1, (-0.68, -0.1, 2.1), (0.2, 0,  0.5),  (-0.95, -0.25, 1.75), (0.4, 0, 0.3)),
    ]
    for side, u_loc, u_rot, l_loc, l_rot in arm_data:
        sfx = 'R' if side > 0 else 'L'
        # Cánh tay trên
        bpy.ops.mesh.primitive_cylinder_add(radius=0.14, depth=0.7, location=u_loc)
        ua = bpy.context.active_object
        ua.name = f"UpperArm_{sfx}"
        ua.rotation_euler = u_rot
        ua.data.materials.append(mat_gold)
        ua.parent = group

        # Cánh tay dưới
        bpy.ops.mesh.primitive_cylinder_add(radius=0.12, depth=0.65, location=l_loc)
        la = bpy.context.active_object
        la.name = f"LowerArm_{sfx}"
        la.rotation_euler = l_rot
        la.data.materials.append(mat_skin)
        la.parent = group

        # Tay nắm (Hand)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.13, location=(
            side * 1.25, -0.38, 1.55))
        hand = bpy.context.active_object
        hand.name = f"Hand_{sfx}"
        hand.scale = (1, 0.7, 0.9)
        hand.data.materials.append(mat_skin)
        hand.parent = group

    # ─── 2 THANH KIẾM (Twin Swords) ───
    sword_data = [
        # (blade_loc, blade_rot, guard_loc, handle_loc)
        ( (1.5, -0.7, 2.1),  (0.3, 0, -0.6),   (1.28, -0.4, 1.58), (1.22, -0.25, 1.42)),
        ((-1.3, -0.5, 1.95), (0.15, 0, 0.5),   (-1.1, -0.32, 1.6), (-1.08, -0.18, 1.45)),
    ]
    for i, (b_loc, b_rot, g_loc, h_loc) in enumerate(sword_data):
        # Lưỡi kiếm dài và mỏng
        bpy.ops.mesh.primitive_cube_add(size=1, location=b_loc)
        blade = bpy.context.active_object
        blade.name = f"Blade_{i}"
        blade.scale = (0.04, 0.012, 0.75)
        blade.rotation_euler = b_rot
        blade.data.materials.append(mat_blade)
        blade.parent = group

        # Bảo vệ tay cầm (Guard)
        bpy.ops.mesh.primitive_cube_add(size=1, location=g_loc)
        guard = bpy.context.active_object
        guard.name = f"Guard_{i}"
        guard.scale = (0.18, 0.03, 0.05)
        guard.rotation_euler = b_rot
        guard.data.materials.append(mat_gold)
        guard.parent = group

        # Cán kiếm (Handle)
        bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.3, location=h_loc)
        handle = bpy.context.active_object
        handle.name = f"Handle_{i}"
        handle.rotation_euler = b_rot
        handle.data.materials.append(mat_gold)
        handle.parent = group

    return group

# ─────────────────────────────────────────────────────────────
# 3. ÁNH SÁNG & CAMERA
# ─────────────────────────────────────────────────────────────
def setup_lighting_camera():
    # Ánh sáng chính (Key Light - phía trước trên)
    bpy.ops.object.light_add(type='SUN', location=(3, -5, 8))
    sun = bpy.context.active_object
    sun.name = "KeyLight"
    sun.data.energy = 3.5
    sun.data.color = (1.0, 0.85, 0.6)
    sun.rotation_euler = (math.radians(45), math.radians(20), 0)

    # Ánh sáng phụ (Fill Light - bên trái)
    bpy.ops.object.light_add(type='AREA', location=(-4, -3, 5))
    fill = bpy.context.active_object
    fill.name = "FillLight"
    fill.data.energy = 800
    fill.data.color = (0.5, 0.65, 1.0)  # Xanh tia sét
    fill.data.size = 3.0

    # Ánh sáng phát sáng vàng từ dưới (Rim Light)
    bpy.ops.object.light_add(type='POINT', location=(0, 2, -1))
    rim = bpy.context.active_object
    rim.name = "RimLight"
    rim.data.energy = 2000
    rim.data.color = (1.0, 0.7, 0.1)

    # Camera
    bpy.ops.object.camera_add(location=(0, -9, 3.5))
    cam = bpy.context.active_object
    cam.name = "MainCamera"
    cam.rotation_euler = (math.radians(82), 0, 0)
    cam.data.lens = 50
    bpy.context.scene.camera = cam

# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────
def main():
    print("[BaTrieu Blender] Bắt đầu tạo mô hình 3D Bà Triệu...")
    clear_scene()

    elephant = create_elephant()
    elephant.location = (0, 0, 0)
    print("[BaTrieu Blender] ✓ Đã tạo Voi Trắng Chiến")

    ba_trieu = create_ba_trieu()
    print("[BaTrieu Blender] ✓ Đã tạo Bà Triệu - Nữ Tướng Cầm Đôi Kiếm")

    setup_lighting_camera()
    print("[BaTrieu Blender] ✓ Đã thiết lập ánh sáng & camera")

    # Xuất file .glb
    output_path = os.path.abspath("public/models/ba_trieu.glb")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    bpy.ops.export_scene.gltf(
        filepath=output_path,
        export_format='GLB',
        export_apply=True,
        export_lights=True,
        export_cameras=True,
    )
    print(f"[BaTrieu Blender] ✓ Đã xuất thành công → {output_path}")
    print(f"[BaTrieu Blender] Kích thước file: {os.path.getsize(output_path):,} bytes")

if __name__ == "__main__":
    main()
