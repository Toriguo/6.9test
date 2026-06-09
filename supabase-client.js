/**
 * Supabase 客户端封装模块
 * 提供图片上传、URL获取、Profile 和 Planets 数据的读写功能
 * 依赖：supabase-config.js（会创建 window.supabaseClient）
 */

(function () {
  'use strict';

  const STORAGE_BUCKET = 'images';
  const PROFILES_TABLE = 'profiles';
  const PLANETS_TABLE = 'planets';
  const CONNECTIONS_TABLE = 'connections';
  const CONNECTION_REQUESTS_TABLE = 'connection_requests';

  function getClient() {
    if (!window.supabaseClient) {
      throw new Error('Supabase client not initialized. Make sure supabase-config.js is loaded first.');
    }
    return window.supabaseClient;
  }

  /* ===== Storage 图片操作 ===== */

  /**
   * 上传图片到 Supabase Storage
   * @param {File} file - 文件对象
   * @param {string} path - 存储路径，例如 'avatars/abc123.png'
   * @returns {Promise<{data?: object, error?: Error}>}
   */
  async function uploadImage(file, path) {
    const client = getClient();
    const { data, error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true,
      });
    return { data, error };
  }

  /**
   * 获取 Storage 中图片的公开 URL
   * @param {string} path - 存储路径
   * @returns {string|null}
   */
  function getImageUrl(path) {
    const client = getClient();
    const { data } = client.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);
    return data && data.publicUrl ? data.publicUrl : null;
  }

  /* ===== Profile 操作 ===== */

  /**
   * 检查 space_id 是否已存在（除了当前slug对应的）
   * @param {string} spaceId - 要检查的ID
   * @param {string} currentSlug - 当前用户的slug（可选，检查时排除自己）
   * @returns {Promise<{exists: boolean, data?: object, error?: Error}>}
   */
  async function checkSpaceIdExists(spaceId, currentSlug = null) {
    const client = getClient();
    let query = client.from(PROFILES_TABLE).select('slug').eq('space_id', spaceId);
    if (currentSlug) {
      query = query.neq('slug', currentSlug); // 排除自己
    }
    const { data, error } = await query.limit(1);
    return { exists: data && data.length > 0, data, error };
  }

  /**
   * 保存或更新 Profile（upsert）
   * @param {string} slug - 唯一标识
   * @param {object} data - 要保存的数据，例如 { avatar_url, ig_link, xhs_link, dy_link }
   * @returns {Promise<{data?: object, error?: Error}>}
   */
  async function saveProfile(slug, data) {
    const client = getClient();
    const payload = {
      slug,
      updated_at: new Date().toISOString(),
      ...data,
    };
    const { data: result, error } = await client
      .from(PROFILES_TABLE)
      .upsert(payload, { onConflict: 'slug' })
      .select()
      .single();
    return { data: result, error };
  }

  /**
   * 根据 slug 获取 Profile
   * @param {string} slug
   * @returns {Promise<{data?: object, error?: Error}>}
   */
  async function getProfile(slug) {
    const client = getClient();
    const { data, error } = await client
      .from(PROFILES_TABLE)
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    return { data, error };
  }

  /**
   * 根据 space_id 获取 Profile（用于搜索 SPACE-XXXX）
   * @param {string} spaceId
   * @returns {Promise<{data?: object, error?: Error}>}
   */
  async function getProfileBySpaceId(spaceId) {
    const client = getClient();
    const { data, error } = await client
      .from(PROFILES_TABLE)
      .select('*')
      .eq('space_id', spaceId)
      .maybeSingle();
    return { data, error };
  }

  /* ===== Planets 操作 ===== */

  /**
   * 保存星球数据（先删除旧数据再插入新数据）
   * @param {string} slug - 所属 profile 的 slug
   * @param {Array} planets - 星球数组，每项包含 { name, images: [{ path }] }
   * @returns {Promise<{data?: object[], error?: Error}>}
   */
  async function savePlanets(slug, planets) {
    const client = getClient();

    // 删除该 slug 下的旧记录
    const { error: deleteError } = await client
      .from(PLANETS_TABLE)
      .delete()
      .eq('slug', slug);

    if (deleteError) {
      return { data: null, error: deleteError };
    }

    if (!planets || planets.length === 0) {
      return { data: [], error: null };
    }

    const rows = planets.map(function (planet, index) {
      return {
        slug,
        planet_index: index,
        name: planet.name || '',
        images: planet.images || [],
        updated_at: new Date().toISOString(),
      };
    });

    const { data, error } = await client
      .from(PLANETS_TABLE)
      .insert(rows)
      .select();

    return { data, error };
  }

  /**
   * 获取某 slug 下的所有星球数据
   * @param {string} slug
   * @returns {Promise<{data?: object[], error?: Error}>}
   */
  async function getPlanets(slug) {
    const client = getClient();
    const { data, error } = await client
      .from(PLANETS_TABLE)
      .select('*')
      .eq('slug', slug)
      .order('planet_index', { ascending: true });
    return { data, error };
  }

  /* ===== Connections 操作 ===== */

  function normalizeConnectionPair(slugA, slugB) {
    return slugA < slugB ? [slugA, slugB] : [slugB, slugA];
  }

  /**
   * 检查两个用户是否已连接
   */
  async function checkConnection(slugA, slugB) {
    const client = getClient();
    const [a, b] = normalizeConnectionPair(slugA, slugB);
    const { data, error } = await client
      .from(CONNECTIONS_TABLE)
      .select('id')
      .eq('slug_a', a)
      .eq('slug_b', b)
      .maybeSingle();
    return { connected: !!data, data, error };
  }

  /**
   * 建立两个用户之间的连接
   */
  async function createConnection(slugA, slugB) {
    const client = getClient();
    const [a, b] = normalizeConnectionPair(slugA, slugB);
    try {
      const existing = await checkConnection(slugA, slugB);
      if (existing.connected) {
        return { data: existing.data, alreadyConnected: true, error: null };
      }
      const result = await withTimeout(
        client
          .from(CONNECTIONS_TABLE)
          .insert({ slug_a: a, slug_b: b })
          .select()
          .single(),
        8000
      );
      return { data: result.data || null, error: result.error || null, alreadyConnected: false };
    } catch (e) {
      return { data: null, error: e, alreadyConnected: false };
    }
  }

  /**
   * 删除两个用户之间的连接
   */
  async function deleteConnection(slugA, slugB) {
    const client = getClient();
    const [a, b] = normalizeConnectionPair(slugA, slugB);
    const { error } = await client
      .from(CONNECTIONS_TABLE)
      .delete()
      .eq('slug_a', a)
      .eq('slug_b', b);
    return { error };
  }

  /**
   * 批量获取当前用户的所有连接好友（含对方 slug 集合）
   * @param {string} slug - 当前用户 slug
   * @returns {Promise<{data?: object[], error?: Error>}
   * 每个元素形如 { slug, space_id, avatar_url }
   */
  async function getAllConnectedFriends(slug) {
    const client = getClient();
    try {
      const connResult = await withTimeout(
        client
          .from(CONNECTIONS_TABLE)
          .select('slug_a, slug_b')
          .or('slug_a.eq.' + slug + ',slug_b.eq.' + slug),
        8000
      );
      const data = connResult.data || [];
      if (!data || data.length === 0) {
        return { data: [], error: connResult.error || null };
      }
      const friendSlugs = [];
      data.forEach(function (row) {
        if (row.slug_a && row.slug_a !== slug) friendSlugs.push(row.slug_a);
        if (row.slug_b && row.slug_b !== slug) friendSlugs.push(row.slug_b);
      });
      if (friendSlugs.length === 0) {
        return { data: [], error: null };
      }
      const profileResult = await withTimeout(
        client
          .from(PROFILES_TABLE)
          .select('slug, space_id, avatar_url, public_planet_index')
          .in('slug', friendSlugs),
        8000
      );
      return { data: profileResult.data || [], error: profileResult.error || null };
    } catch (e) {
      return { data: [], error: e };
    }
  }

  /* ===== Connection Requests 操作 ===== */

  /**
   * 发送连接申请
   * @param {string} fromSlug - 申请者 slug
   * @param {string} toSlug - 被申请者 slug
   * @returns {Promise<{data?: object, error?: Error, alreadyPending?: boolean}>}
   */
  async function sendConnectionRequest(fromSlug, toSlug) {
    const client = getClient();
    try {
      // 检查是否已有 pending 请求
      const existingResult = await withTimeout(
        client
          .from(CONNECTION_REQUESTS_TABLE)
          .select('id')
          .eq('from_slug', fromSlug)
          .eq('to_slug', toSlug)
          .eq('status', 'pending')
          .maybeSingle(),
        8000
      );
      if (existingResult.data) {
        return { data: existingResult.data, alreadyPending: true, error: null };
      }
      const insertResult = await withTimeout(
        client
          .from(CONNECTION_REQUESTS_TABLE)
          .insert({ from_slug: fromSlug, to_slug: toSlug, status: 'pending' })
          .select()
          .single(),
        8000
      );
      return { data: insertResult.data, error: insertResult.error, alreadyPending: false };
    } catch (e) {
      return { data: null, error: e, alreadyPending: false };
    }
  }

  /**
   * 获取发给某人的所有 pending 请求（含申请人 profile 信息）
   * @param {string} slug - 被申请者 slug
   * @returns {Promise<{data?: object[], error?: Error}>}
   */
  async function getPendingRequests(slug) {
    const client = getClient();
    try {
      const reqResult = await withTimeout(
        client
          .from(CONNECTION_REQUESTS_TABLE)
          .select('id, from_slug, created_at')
          .eq('to_slug', slug)
          .eq('status', 'pending')
          .order('created_at', { ascending: false }),
        8000
      );
      const data = reqResult.data || [];
      const error = reqResult.error || null;
      if (error || data.length === 0) {
        return { data: data, error: error };
      }
      // 批量获取所有申请者的 profile 信息
      const fromSlugs = data.map(function (r) { return r.from_slug; });
      const profileResult = await withTimeout(
        client
          .from(PROFILES_TABLE)
          .select('slug, space_id, avatar_url')
          .in('slug', fromSlugs),
        8000
      );
      const profiles = profileResult.data || [];
      // 将 profile 信息合并到请求中
      const profileMap = {};
      profiles.forEach(function (p) { profileMap[p.slug] = p; });
      const result = data.map(function (req) {
        const profile = profileMap[req.from_slug] || {};
        return {
          id: req.id,
          from_slug: req.from_slug,
          from_space_id: profile.space_id || 'SPACE-????',
          from_avatar_url: profile.avatar_url || 'imgs/3.svg',
          created_at: req.created_at,
        };
      });
      return { data: result, error: profileResult.error || null };
    } catch (e) {
      return { data: [], error: e };
    }
  }

  /**
   * 响应连接申请（接受或拒绝）
   * @param {number} requestId - 请求 ID
   * @param {'accepted'|'rejected'} newStatus
   * @returns {Promise<{data?: object, error?: Error}>}
   */
  // 数据库操作超时包装器
  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function (_, reject) {
        return setTimeout(function () { return reject(new Error('请求超时（' + ms + 'ms）')); }, ms);
      })
    ]);
  }

  async function respondToRequest(requestId, newStatus) {
    const client = getClient();
    try {
      const result = await withTimeout(
        client
          .from(CONNECTION_REQUESTS_TABLE)
          .update({ status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', requestId)
          .select()
          .single(),
        8000
      );
      return result;
    } catch (e) {
      return { data: null, error: e };
    }
  }

  /**
   * 检查我发给某人的申请状态
   * @param {string} fromSlug - 我的 slug
   * @param {string} toSlug - 对方 slug
   * @returns {Promise<{status?: string|null, requestId?: number|null, error?: Error}>}
   */
  async function checkMySentRequest(fromSlug, toSlug) {
    const client = getClient();
    try {
      const result = await withTimeout(
        client
          .from(CONNECTION_REQUESTS_TABLE)
          .select('id, status')
          .eq('from_slug', fromSlug)
          .eq('to_slug', toSlug)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        8000
      );
      if (result.error || !result.data) {
        return { status: null, requestId: null, error: result.error || null };
      }
      return { status: result.data.status, requestId: result.data.id, error: null };
    } catch (e) {
      return { status: null, requestId: null, error: e };
    }
  }

  /* ===== 工具函数 ===== */

  /**
   * 生成随机 8 字符 slug（字母+数字）
   * @returns {string}
   */
  function generateSlug() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    for (let i = 0; i < 8; i++) {
      slug += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return slug;
  }

  /* ===== 暴露到全局 ===== */
  window.supabaseApi = {
    uploadImage,
    getImageUrl,
    checkSpaceIdExists,
    saveProfile,
    getProfile,
    getProfileBySpaceId,
    checkConnection,
    createConnection,
    deleteConnection,
    getAllConnectedFriends,
    savePlanets,
    getPlanets,
    generateSlug,
    sendConnectionRequest,
    getPendingRequests,
    respondToRequest,
    checkMySentRequest,
  };
})();