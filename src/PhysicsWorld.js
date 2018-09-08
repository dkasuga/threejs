/* global THREE: false, Ammo: false */

export default class PhysicsWorld {
  constructor (gravity = new Ammo.btVector3(0, -100.0, 0)) {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration()
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration)
    const broadphase = new Ammo.btDbvtBroadphase()
    const solver = new Ammo.btSequentialImpulseConstraintSolver()
    this.physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration)
    this.physicsWorld.setGravity(gravity)
    this.physicsWorld.dynamicObjects = []
    this.physicsWorld.update = this.update
    this.physicsWorld.updateDynamicObjectsModelPose = this.updateDynamicObjectsModelPose
    this.physicsWorld.addSphereBody = this.addSphereBody
    this.physicsWorld.addBoxBody = this.addBoxBody
    this.physicsWorld.addCylinderBody = this.addCylinderBody
    this.physicsWorld.addConeBody = this.addConeBody
    this.physicsWorld.addCapsuleBody = this.addCapsuleBody
    this.physicsWorld.addConvexBody = this.addConvexBody
    this.physicsWorld.addTriangleBody = this.addTriangleBody
    this.physicsWorld.addHumanBody = this.addHumanBody
    this.physicsWorld.setPhysicsPose = this.setPhysicsPose
    this.physicsWorld.setModelPose = this.setModelPose
    this.physicsWorld.hitTest = this.hitTest
    return this.physicsWorld
  }

  // 物理世界のシミュレーションを更新する（重力計算、衝突計算など）
  update = (deltaTime) => {
    this.physicsWorld.stepSimulation(deltaTime, 10)
  }

  updateDynamicObjectsModelPose = () => {
    for (let i = 0; i < this.physicsWorld.dynamicObjects.length; i++) {
      const objThree = this.physicsWorld.dynamicObjects[ i ]
      if (objThree.userData && objThree.userData.ignorePhysics) {
        continue
      }
      this.setModelPose(objThree)
    }
  }

  addSphereBody = (objThree, radius, mass) => {
    const shape = new Ammo.btSphereShape(radius)
    shape.setMargin(0.05)

    const transform = this.createTransform(objThree.position, objThree.quaternion)
    objThree.userData.physicsBody = this.createBody(mass, transform, shape)
    this.physicsWorld.addRigidBody(objThree.userData.physicsBody)
  }

  addBoxBody = (objThree, size, mass) => {
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5))
    shape.setMargin(0.05)

    const pos = new THREE.Vector3(objThree.position.x, objThree.position.y, objThree.position.z)
    const transform = this.createTransform(pos, objThree.quaternion)
    objThree.userData.physicsBody = this.createBody(mass, transform, shape)
    this.physicsWorld.addRigidBody(objThree.userData.physicsBody)
  }

  addCylinderBody = (objThree, radius, height, mass) => {
    const shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, height * 0.5, radius))
    shape.setMargin(0.05)

    const transform = this.createTransform(objThree.position, objThree.quaternion)
    objThree.userData.physicsBody = this.createBody(mass, transform, shape)
    this.physicsWorld.addRigidBody(objThree.userData.physicsBody)
  }

  addConeBody = (objThree, radius, height, mass) => {
    const shape = new Ammo.btConeShape(radius, height)
    shape.setMargin(0.05)

    const transform = this.createTransform(objThree.position, objThree.quaternion)
    objThree.userData.physicsBody = this.createBody(mass, transform, shape)
    this.physicsWorld.addRigidBody(objThree.userData.physicsBody)
  }

  addCapsuleBody = (objThree, radius, height, mass) => {
    const shape = new Ammo.btCapsuleShape(radius, height * 0.5)
    shape.setMargin(0.05)

    const transform = this.createTransform(objThree.position, objThree.quaternion)
    objThree.userData.physicsBody = this.createBody(mass, transform, shape)
    this.physicsWorld.addRigidBody(objThree.userData.physicsBody)
  }

  addConvexBody = (objThree, vertices, mass) => {
    const shape = new Ammo.btConvexHullShape()
    for (let  i = 0; i < vertices.length; i++) {
      const vec = vertices[i]
      shape.addPoint(new Ammo.btVector3(vec.x, vec.y, vec.z))
    }

    const transform = this.createTransform(objThree.position, objThree.quaternion)
    objThree.userData.physicsBody = this.createBody(mass, transform, shape)
    this.physicsWorld.addRigidBody(objThree.userData.physicsBody)
  }

  addTriangleBody = (objThree, vertices, faces, mass) => {
    const triangle_mesh = new Ammo.btTriangleMesh()
    const triangles = []
    for (let i = 0; i < faces.length; i++) {
      const face = faces[i]
      if (face instanceof THREE.Face3) {

        triangles.push([
					{ x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
					{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
					{ x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z },
        ])

      } else if (face instanceof THREE.Face4) {

        triangles.push([
					{ x: vertices[face.a].x, y: vertices[face.a].y, z: vertices[face.a].z },
					{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
					{ x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z },
        ])
        triangles.push([
					{ x: vertices[face.b].x, y: vertices[face.b].y, z: vertices[face.b].z },
					{ x: vertices[face.c].x, y: vertices[face.c].y, z: vertices[face.c].z },
					{ x: vertices[face.d].x, y: vertices[face.d].y, z: vertices[face.d].z },
        ])

      }
    }

    for (let i = 0; i < triangles.length; i++) {
      const triangle = triangles[i]

      const a = new Ammo.btVector3(triangle[0].x, triangle[0].y, triangle[0].z)
      const b = new Ammo.btVector3(triangle[1].x, triangle[1].y, triangle[1].z)
      const c = new Ammo.btVector3(triangle[2].x, triangle[2].y, triangle[2].z)

      triangle_mesh.addTriangle(a, b, c, true)
    }

    const shape = new Ammo.btBvhTriangleMeshShape(
      triangle_mesh,
      true,
      true
    )

    const transform = this.createTransform(objThree.position, objThree.quaternion)
    objThree.userData.physicsBody = this.createBody(mass, transform, shape)
    this.physicsWorld.addRigidBody(objThree.userData.physicsBody)
  }

  addHumanBody = (objThree, scale = 1, friction = 1, mass = 200) => {
    this.addCapsuleBody(objThree, (objThree.size.x ** 2 + objThree.size.z ** 2) ** 0.5 * 0.5 * scale, objThree.size.y, mass)
    objThree.userData.physicsBody.setAngularFactor(0, 1, 0)
    objThree.userData.physicsBody.setFriction(friction)
  }

  // 物理世界の姿勢作成
  createTransform = (pos = new THREE.Vector3(0, 0, 0), q = new THREE.Quaternion(0, 0, 0, 1)) => {
    const transform = new Ammo.btTransform()
    transform.setIdentity()
    transform.setOrigin(new Ammo.btVector3(pos.x, pos.y, pos.z))
    transform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w))
    return transform
  }

  // 物理世界の衝突オブジェクトを作成
  createBody = (mass, transform, shape, isKinematic = false, isStatic = false) => {
    const localInertia = new Ammo.btVector3(0, 0, 0)
    const isStaticOrKinematic = isStatic || isKinematic
    if (!isStaticOrKinematic) {
      shape.calculateLocalInertia(mass, localInertia)
    }
    const motionState = new Ammo.btDefaultMotionState(transform)
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(isStaticOrKinematic ? 0 : mass, motionState, shape, localInertia)
    const body = new Ammo.btRigidBody(rbInfo)
    if (isKinematic) {
      const BODYFLAG_KINEMATIC_OBJECT = 2
      const BODYSTATE_DISABLE_DEACTIVATION = 4
      body.setCollisionFlags(body.getCollisionFlags() | BODYFLAG_KINEMATIC_OBJECT)
      body.setActivationState(BODYSTATE_DISABLE_DEACTIVATION)
    }
    return body
  }

  // モデルの描画姿勢を物理世界の姿勢に反映
  setPhysicsPose = (objThree) => {
    const objPhys = objThree.userData.physicsBody && objThree.userData.physicsBody
    if (objPhys) {
      const pos = objThree.position
      const center = objThree.center ? objThree.center : new THREE.Vector3(0, 0, 0)
      const q = objThree.quaternion
      const transform = new Ammo.btTransform()
      transform.setIdentity()
      transform.setOrigin(new Ammo.btVector3(pos.x - center.x, pos.y - center.y, pos.z - center.z))
      transform.setRotation(new Ammo.btQuaternion(q.x, q.y, q.z, q.w))
      const motionState = new Ammo.btDefaultMotionState(transform)
      // sleep状態を強制解除して計算対象に含める
      const ACTIVE_TAG = 1
      objPhys.forceActivationState(ACTIVE_TAG)
      objPhys.activate()
      objPhys.setMotionState(motionState)
    }
  }

  // 物理世界の姿勢をモデルの描画姿勢に反映
  setModelPose = (objThree) => {
    const ms = objThree.userData.physicsBody && objThree.userData.physicsBody.getMotionState()
    if (ms) {
      let transformAux1 = new Ammo.btTransform()
      ms.getWorldTransform(transformAux1)
      const p = transformAux1.getOrigin()
      const q = transformAux1.getRotation()
      const center = objThree.center ? objThree.center : new THREE.Vector3(0, 0, 0)
      objThree.position.set(p.x() + center.x, p.y() + center.y, p.z() + center.z)
      objThree.quaternion.set(q.x(), q.y(), q.z(), q.w())
      if (objThree.boxHelper) {
        objThree.boxHelper.setFromObject(objThree)
      }
    }
  }

  // 物理空間上のオブジェクトの当たり判定
  hitTest = (targets, needHitPoint = false) => {

    const targetPtrs = {}
    for (let key in targets) {
      const target = targets[key]
      if (!target.userData.physicsBody) continue
      delete target.userData.hits
      targetPtrs[target.userData.physicsBody.ptr] = {}
    }

    const hits = []
    const numManifolds = this.physicsWorld.getDispatcher().getNumManifolds()
    for (let i = 0; i < numManifolds; i++) {
      const contactManifold = this.physicsWorld.getDispatcher().getManifoldByIndexInternal(i)
      const objA = contactManifold.getBody0()
      const objB = contactManifold.getBody1()
      if (!targetPtrs[objA.ptr] || !targetPtrs[objB.ptr]) continue

      if (needHitPoint) {
        const numContacts = contactManifold.getNumContacts()
        const pts = []
        for (let j = 0; j < numContacts; j++) {
          const pt = contactManifold.getContactPoint(j)
          if (pt.getDistance() < 0) {
            const ptA = pt.getPositionWorldOnA()
            const ptB = pt.getPositionWorldOnB()
            pts.push({a: ptA, b: ptB})
          }
        }
        hits.push({a: objA.ptr, b: objB.ptr, pts})
      } else {
        hits.push({a: objA.ptr, b: objB.ptr})
      }
    }


    return hits
  }

}
